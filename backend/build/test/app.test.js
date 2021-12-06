"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe("Test cors config", () => test("Verify", () => {
    expect(app_1.corsConfig.credentials).toBe(true);
}));
describe("Test root path", () => test("GET method response", () => (0, supertest_1.default)(app_1.app).get("/").expect(200)));
//# sourceMappingURL=app.test.js.map