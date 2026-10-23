# Migrating this project from MySQL to MongoDB

This is a guide for a possible migration; it does not make the migration. The
current API uses Sequelize with MySQL. The examples below use **Mongoose** as
the MongoDB object-document mapper, keep the existing API field names where
practical, and expose MongoDB `_id` values as string `id` values so the API
continues to return the `id` property the frontend already expects.

## What changes and what stays the same

Express routes, request validation, password hashing with bcrypt, login
behavior, and the general API response shapes can remain. The database
connection, Sequelize models, repository queries, duplicate-email error
handling, health check, database environment variables, and numeric ID
assumptions must change. MongoDB does not convert the current MySQL tables
automatically.

| File | What would change |
| --- | --- |
| `server/package.json` and `server/package-lock.json` | Replace `sequelize` and `mysql2` with `mongoose`. Update the lock file with npm; do not edit it by hand. |
| `server/.env.example` | Replace the separate MySQL settings with a MongoDB connection URI. |
| `server/src/config/database.js` | Connect to MongoDB using Mongoose and the URI. |
| `server/src/server.js` | Await the MongoDB connection before listening for API requests. |
| `server/src/models/user.model.js` and `server/src/models/task.model.js` | Replace Sequelize models with Mongoose schemas and models. Use ObjectIds instead of auto-incrementing integers. |
| `server/src/repositories/user.repository.js` and `server/src/repositories/task.repository.js` | Rewrite Sequelize `where`/`findAll`/`create`/`update`/`destroy` calls as Mongoose operations, and preserve the API's `id` shape. |
| `server/src/controllers/auth.controller.js` | Replace Sequelize's unique-constraint error check with MongoDB's duplicate-key error handling. |
| `server/src/routes/health.routes.js` | Check the MongoDB connection and report MongoDB-specific errors/status. |
| `server/src/validators/task.validator.js` and `server/src/routes/task.routes.js` | Validate task route IDs as 24-character MongoDB ObjectId strings instead of passing numeric IDs. |
| `frontend/src/App.tsx`, `frontend/src/components/TaskItem.tsx`, `frontend/src/components/TaskList.tsx`, and `frontend/src/components/TaskForm.tsx` | Change task ID types from `number` to `string`; IDs are also used for React keys and API URLs. |
| `DEPENDENCIES.md` | Update the project setup and dependency description from MySQL/Sequelize to MongoDB/Mongoose. |

`server/src/services/auth.services.js`, `server/src/services/task.services.js`,
`server/src/controllers/task.controller.js`, and
`server/src/middleware/authenticate.js` are designed to call the repositories.
Their business logic can mostly stay, but review them after the repository and
ID changes because IDs passed through sessions and task operations will now be
strings.

## 1. Install the MongoDB dependency

From `server/`, replace the SQL packages with Mongoose:

```powershell
npm uninstall sequelize mysql2
npm install mongoose
```

This changes `server/package.json` and regenerates `server/package-lock.json`.
Keep all unrelated dependencies. Do not keep Sequelize models or MySQL
configuration after the code migration is complete.

## 2. Change the connection settings

Replace the MySQL variables in `server/.env.example` with a URI. For local
MongoDB, an example is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/task_app
```

For a hosted database, use the provider's URI and keep its username/password
in the untracked `server/.env`, never in `.env.example` or source control.
Percent-encode special characters in credentials as required by the URI
format. `SESSION_SECRET` and the other non-database settings remain.

Replace `server/src/config/database.js` with a connection helper:

```js
import mongoose from "mongoose";

export default async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be added in server/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  return mongoose.connection;
}
```

Then update `server/src/server.js` to call the helper before starting the
listener:

```js
import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Task App API listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the Application: ", error);
    process.exit(1);
  }
}

startServer();
```

Keep startup failure visible; the API should not claim to be running when it
cannot connect to its database.

## 3. Replace the Sequelize models

MongoDB documents have `_id` ObjectIds, rather than MySQL auto-incrementing
integer primary keys. Preserve the current application field names (`user_id`,
`password_hash`, and `image_url`) to minimize unrelated API changes.

An example `server/src/models/user.model.js`:

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password_hash: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default mongoose.model("User", userSchema);
```

An example `server/src/models/task.model.js`:

```js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: null },
    completed: { type: Boolean, default: false },
    image_url: { type: String, default: null },
  },
  {
    collection: "tasks",
    timestamps: true,
  },
);

export default mongoose.model("Task", taskSchema);
```

Mongoose's `unique` option creates a unique index; it is not a normal
validation rule. Ensure the index is successfully built and handle duplicate
email errors in the controller as shown below. Keep `user_id` as an ObjectId
reference; MongoDB does not enforce SQL-style foreign keys, so the API must
continue to scope task operations to the signed-in user.

## 4. Rewrite repository operations and preserve `id` in JSON

Mongoose returns `_id`, but the current frontend reads `task.id`. Convert
documents to plain objects at the repository/API boundary. For example, add a
small helper in each repository or a shared utility:

```js
function toApiDocument(document) {
  if (!document) return null;
  const value = document.toObject();
  const { _id, __v, ...fields } = value;
  return { ...fields, id: _id.toString() };
}
```

In `server/src/repositories/user.repository.js`, replace Sequelize's `where`
queries with Mongoose filters. For example:

```js
import User from "../models/user.model.js";

export async function findUserByEmail(email) {
  return User.findOne({ email });
}

export async function findUserById(id) {
  const user = await User.findById(id).select("-password_hash");
  return toApiDocument(user);
}

export async function createUser(email, password_hash) {
  const user = await User.create({ email, password_hash });
  return { id: user._id.toString(), email: user.email };
}
```

`findUserByEmail` deliberately returns the Mongoose document so
`auth.services.js` can continue to compare `user.password_hash` with bcrypt.
Do not return `password_hash` from public user/API responses.

In `server/src/repositories/task.repository.js`, use filters and MongoDB
updates/deletes. Keep the `user_id` constraint in **every** task lookup,
update, and delete so a user cannot operate on another user's task:

```js
async findTasksByUserId(user_id) {
  const tasks = await Task.find({ user_id }).sort({ createdAt: -1 });
  return tasks.map(toApiDocument);
}

async createTask(taskData) {
  return toApiDocument(await Task.create(taskData));
}

async updateTask({ id, user_id, title, description = null,
                   image_url = null, completed = null }) {
  const task = await Task.findOneAndUpdate(
    { _id: id, user_id },
    { $set: { title, description, image_url, completed } },
    { new: true, runValidators: true },
  );
  return task ? toApiDocument(task) : null;
}

async deleteTask(id, user_id) {
  const result = await Task.deleteOne({ _id: id, user_id });
  return result.deletedCount > 0 ? id : null;
}
```

This is the shape of the changes, not a drop-in full repository file: retain
the existing class/export structure and add the needed imports/helper when
applying it. Verify the MongoDB sort field (`createdAt`) matches the
Mongoose timestamp configuration. The current SQL schema uses `created_at`;
Mongoose timestamps default to camelCase unless configured otherwise.

## 5. Handle MongoDB IDs and duplicate emails

Change the task ID assumptions in the backend and frontend. Validate route
parameters before calling Mongoose so malformed IDs produce a controlled
client error instead of a database cast exception. One possible validator
shape in `server/src/validators/task.validator.js` is:

```js
export const taskIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
```

The existing `validate` middleware validates request bodies only. Add or use
parameter-validation middleware in `server/src/routes/task.routes.js` for both
`PUT /:id` and `DELETE /:id`, or validate `req.params.id` in a dedicated
middleware. Return HTTP 400 for a malformed ID; keep HTTP 404 behavior for a
well-formed ID that does not identify a task owned by the user.

In `server/src/controllers/auth.controller.js`, remove the Sequelize
`UniqueConstraintError` import. MongoDB duplicate-key errors use code `11000`:

```js
if (error?.code === 11000) {
  return res.status(409).json({
    message: "An account with this email already exists",
  });
}
```

Change `id: number` to `id: string` in the `Task` and `ServerTask` types in
`frontend/src/App.tsx`, and in the task ID callback parameters in
`App.tsx`, `frontend/src/components/TaskItem.tsx`,
`frontend/src/components/TaskList.tsx`, and
`frontend/src/components/TaskForm.tsx`. Keep IDs as strings when making task
URLs, comparing IDs, and assigning React keys. The backend response conversion
above is what makes `result.task.id` work without making the frontend depend
directly on MongoDB's `_id` field.

## 6. Update the health check and dependency documentation

In `server/src/routes/health.routes.js`, replace the Sequelize import and
`authenticate()` call with Mongoose's connection state. Also replace the
required-settings check with a check for `MONGODB_URI`. A healthy response can
report `mongoose.connection.name`; do not return the URI or credentials.
Update the failure text to refer to MongoDB and keep returning HTTP 503 when
the database is unavailable.

In `DEPENDENCIES.md`, change the setup instructions to require MongoDB and
`MONGODB_URI`, and replace the `mysql2`/Sequelize dependency entries with
Mongoose. The frontend dependencies and commands do not otherwise need to
change.

## 7. Sessions and existing data

The current `express-session` configuration in `server/src/app.js` does not
configure a database session store; Express therefore uses its in-memory
default. Switching application data to MongoDB does not automatically move
sessions. In-memory sessions are lost on process restart and are unsuitable
for a multi-instance production deployment. If persistent/shared sessions are
needed, separately add and configure a MongoDB-compatible session store (for
example, `connect-mongo`) in `server/src/app.js`. This is an optional
production improvement, not required to connect the app's user/task models to
MongoDB.

Plan a separate data migration if existing MySQL accounts and tasks must be
kept. Export the `users` and `tasks` data, insert users first, map each old
integer user ID to its new MongoDB ObjectId, then rewrite every task's
`user_id` using that mapping. Preserve `password_hash` values so existing
passwords remain usable, and verify email uniqueness, dates, nullable fields,
and task ownership before switching traffic. The MySQL integer IDs cannot be
copied as MongoDB ObjectIds. Existing sessions may need users to sign in
again, especially if IDs stored in sessions still refer to the old database.
Keep a verified backup and a rollback plan; do not delete the old database
until the migrated data and application have been checked.

## Suggested migration order and checks

1. Back up MySQL data and decide whether it must be migrated.
2. Add Mongoose, configure `MONGODB_URI`, and verify a local/hosted MongoDB
   connection.
3. Add the schemas and rewrite repositories, preserving the `id` response
   contract and per-user task filtering.
4. Update duplicate-email handling, health checks, ObjectId validation, and
   frontend ID types.
5. Migrate data if needed, then test signup/login, `/api/health/db`, task
   creation/list/update/delete, invalid task IDs, and cross-user task access.
6. Build the frontend and run the API; confirm task IDs are strings and the
   app still works end-to-end before switching users to MongoDB.
