"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileBinaryById = exports.updateOrDeleteFileBinary = exports.createFileBinary = void 0;
const fileBinaryModel_1 = __importDefault(require("./fileBinaryModel"));
const createFileBinary = (userId) => (0, fileBinaryModel_1.default)(userId).doc();
exports.createFileBinary = createFileBinary;
const updateOrDeleteFileBinary = (userId, fileBinaryId) => (0, fileBinaryModel_1.default)(userId).doc(fileBinaryId);
exports.updateOrDeleteFileBinary = updateOrDeleteFileBinary;
const getFileBinaryById = async (userId, id) => {
    const fileDataDocument = await (0, fileBinaryModel_1.default)(userId).doc(id).get();
    if (!fileDataDocument.exists)
        return undefined;
    return fileDataDocument.data();
};
exports.getFileBinaryById = getFileBinaryById;
//# sourceMappingURL=fileBinaryService.js.map