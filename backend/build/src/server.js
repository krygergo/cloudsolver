"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const app_1 = require("./app");
const logger_1 = require("./config/logger");
const logger = (0, winston_1.createLogger)(logger_1.defaultConfig);
app_1.app.listen(3000);
logger.info("Server is now listening");
//# sourceMappingURL=server.js.map