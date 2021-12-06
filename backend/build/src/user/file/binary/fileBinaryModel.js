"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleFirestore_1 = __importDefault(require("../../../config/googleFirestore"));
const fileDataConverter = {
    toFirestore(fileBinary) {
        return fileBinary;
    },
    fromFirestore(snapshot) {
        return snapshot.data();
    }
};
exports.default = (userId) => (0, googleFirestore_1.default)()
    .collection("User")
    .doc(userId)
    .collection("FileBinary")
    .withConverter(fileDataConverter);
//# sourceMappingURL=fileBinaryModel.js.map