import { createLogger } from "winston";
import app from "./app";
import get_logger from "./config/logger";

const logger = get_logger();

app.listen(3000);

logger.info("Server is now listening");
