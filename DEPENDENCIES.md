# Project dependencies

The project has two npm packages: the React frontend in `frontend/` and the
Express API in `server/`. Install and run them separately. Node.js and npm are
required.

## Install and run

From the repository root, open one terminal for the frontend:

```sh
cd frontend
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173`.

Open a second terminal at the repository root for the API:

```sh
cd server
npm install
npm run dev
```

The API listens on port 3000 by default. It requires a MySQL database and a
`server/.env` file. Copy `server/.env.example` to `server/.env` and set the
database credentials and a strong `SESSION_SECRET`.

To add a package, run `npm install <package>` for an app/runtime dependency or
`npm install -D <package>` for a development tool, from the relevant directory
(`frontend/` or `server/`).

## Frontend dependencies

Run these install commands from `frontend/`.

| Package | Type | Purpose and where it is used |
| --- | --- | --- |
| `react` | Runtime | Builds the user interface, manages component state and effects; used throughout `frontend/src/`. |
| `react-dom` | Runtime | Mounts the React app into the browser page; used in `frontend/src/main.tsx`. |
| `tailwindcss` | Runtime | Provides utility CSS and theme directives; imported in `frontend/src/index.css`. |
| `@tailwindcss/vite` | Runtime | Integrates Tailwind CSS with Vite; configured in `frontend/vite.config.ts`. |
| `vite` | Development | Runs the frontend dev server and builds/previews production assets; used by the frontend npm scripts. |
| `@vitejs/plugin-react` | Development | Adds React/TSX support and Fast Refresh to Vite; configured in `frontend/vite.config.ts`. |
| `typescript` | Development | Type-checks the TypeScript/TSX frontend; used by `npm run build` and `frontend/tsconfig*.json`. |
| `@types/react` | Development | TypeScript declarations for React and JSX used in `frontend/src/`. |
| `@types/react-dom` | Development | TypeScript declarations for React DOM used in `frontend/src/main.tsx`. |
| `@types/node` | Development | Node.js declarations for the Vite config; included by `frontend/tsconfig.node.json`. |
| `eslint` | Development | Linting engine invoked by the `lint` script. |
| `@eslint/js` | Development | Standard JavaScript rules for ESLint configuration. |
| `typescript-eslint` | Development | TypeScript parser and rules for ESLint. |
| `eslint-plugin-react-hooks` | Development | Lint rules for correct React Hooks usage. |
| `eslint-plugin-react-refresh` | Development | Lint rules for React Fast Refresh compatibility. |
| `globals` | Development | Global variable definitions used by ESLint configurations. |

The frontend declares ESLint packages and a `lint` script, but currently has no
`eslint.config.*` file, so linting does not run until a configuration is added.

## API dependencies

Run these install commands from `server/`. These are all runtime dependencies.

| Package | Purpose and where it is used |
| --- | --- |
| `express` | HTTP server, JSON body parsing, and route handling; used in `server/src/app.js` and `server/src/routes/`. |
| `cors` | Allows the configured frontend origin to make credentialed API requests; used in `server/src/app.js`. |
| `express-session` | Maintains signed login sessions in cookies; used in `server/src/app.js` and authentication routes/middleware. |
| `express-rate-limit` | Limits requests to the versioned API to 200 per 15-minute window; configured in `server/src/app.js`. |
| `helmet` | Adds security-related HTTP response headers; used in `server/src/app.js`. |
| `dotenv` | Loads configuration from `server/.env`; used by `server/src/server.js` and `server/src/config/database.js`. |
| `mysql2` | Connects to MySQL using a promise-based connection pool; used by `server/src/config/database.js` and repositories. |
| `bcrypt` | Hashes passwords during signup and compares hashes during login; used in `server/src/services/auth.services.js`. |
| `zod` | Defines and validates API request data such as login and signup; used in `server/src/validators/` and validation middleware. |

## Useful commands

Run each command from its listed directory.

| Directory | Command | What it does |
| --- | --- | --- |
| `frontend/` | `npm run dev` | Starts the Vite development server. |
| `frontend/` | `npm run build` | Type-checks and builds the frontend for production. |
| `frontend/` | `npm run lint` | Runs ESLint (currently requires an ESLint config file). |
| `frontend/` | `npm run preview` | Locally previews the production build. |
| `server/` | `npm run dev` | Starts the API with automatic restart on file changes. |
| `server/` | `npm start` | Starts the API without watch mode. |
