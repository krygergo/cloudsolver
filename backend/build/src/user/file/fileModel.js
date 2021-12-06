"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileType = void 0;
const googleFirestore_1 = __importDefault(require("../../config/googleFirestore"));
const fileConverter = {
    toFirestore(file) {
        return file;
    },
    fromFirestore(snapshot) {
        return snapshot.data();
    }
};
const getFileType = (name) => {
    const fileType = name.slice(name.length - 3);
    if (fileType === "mzn")
        return "mzn";
    if (fileType === "dzn")
        return "dzn";
    return undefined;
};
exports.getFileType = getFileType;
exports.default = (userId) => (0, googleFirestore_1.default)()
    .collection("User")
    .doc(userId)
    .collection("File")
    .withConverter(fileConverter);
//# sourceMappingURL=fileModel.js.map