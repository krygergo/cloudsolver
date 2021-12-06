"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSessionById = void 0;
const sessionModel_1 = __importDefault(require("./sessionModel"));
const getUserSessionById = async (id) => {
    const data = (await (0, sessionModel_1.default)().doc(id).get()).data()?.data;
    if (!data)
        return undefined;
    return JSON.parse(data);
};
exports.getUserSessionById = getUserSessionById;
//# sourceMappingURL=sessionService.js.map