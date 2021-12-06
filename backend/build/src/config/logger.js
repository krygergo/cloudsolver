"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const winston_1 = __importDefault(require("winston"));
const environment_1 = require("./environment");
const level = () => {
    if (environment_1.env.NODE_ENV === "test")
        return "error";
    else if (environment_1.env.NODE_ENV === "prod")
        return "warn";
    else
        return "info";
};
exports.defaultConfig = {
    level: level(),
    transports: [new winston_1.default.transports.Console()]
};
//# sourceMappingURL=logger.js.map