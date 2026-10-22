import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/database.js";

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await sequelize.authenticate();

    app.listen(port, () => {
      console.log(`Task App API listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the Application: ", error);
    process.exit(1);
  }
}

startServer();
