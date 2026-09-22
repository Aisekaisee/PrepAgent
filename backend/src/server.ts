import { app } from "./app";
import { env } from "./config/env";
import { checkDatabaseConnection } from "./db/client";
import { logger } from "./utils/logger";

async function startServer() {
  try {
    await checkDatabaseConnection();

    logger.info("Database connected");

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error, "Failed to start server");
    process.exit(1);
  }
}

startServer();