import { createLogger } from "winston";
import app from "./app";
import { defaultConfig } from "./config/logger";

const logger = createLogger(defaultConfig);

app.listen(3000);

logger.info("Server is now listening");
