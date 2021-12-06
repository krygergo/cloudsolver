"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.corsConfig = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const winston_1 = require("winston");
const environment_1 = require("./config/environment");
const logger_1 = require("./config/logger");
const routing_1 = require("./config/routing");
const logger = (0, winston_1.createLogger)(logger_1.defaultConfig);
const app = (0, express_1.default)();
exports.app = app;
exports.corsConfig = {
    origin: environment_1.env.EXPRESS_ALLOW_ORIGIN,
    credentials: true
};
app.use((0, cors_1.default)(exports.corsConfig));
logger.info(`Allows requests from origin ${environment_1.env.EXPRESS_ALLOW_ORIGIN}`);
app.use(express_1.default.json());
app.get("/", (_, res) => res.send("Ok"));
app.use("/", routing_1.route);
//# sourceMappingURL=app.js.map