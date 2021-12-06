"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.ExitCodes = void 0;
var ExitCodes;
(function (ExitCodes) {
    ExitCodes[ExitCodes["MISSING_EXPRESS_PROGRAM_STAGE"] = 0] = "MISSING_EXPRESS_PROGRAM_STAGE";
    ExitCodes[ExitCodes["MISSING_EXPRESS_COOKIE_SECRET"] = 1] = "MISSING_EXPRESS_COOKIE_SECRET";
})(ExitCodes = exports.ExitCodes || (exports.ExitCodes = {}));
exports.env = process.env;
//# sourceMappingURL=environment.js.map