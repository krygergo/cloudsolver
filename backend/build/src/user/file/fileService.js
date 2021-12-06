"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileByType = exports.getFileByName = exports.getAllFiles = exports.deleteFile = exports.updateFileName = exports.updateFileData = exports.addFile = void 0;
const fileModel_1 = __importDefault(require("./fileModel"));
const fileBinaryService_1 = require("./binary/fileBinaryService");
const googleFirestore_1 = __importDefault(require("../../config/googleFirestore"));
const firestore = (0, googleFirestore_1.default)();
const createFile = (userId) => (0, fileModel_1.default)(userId).doc();
const addFile = async (userId, fileUpload) => {
    const fileSnapshot = await (0, fileModel_1.default)(userId).where("name", "==", fileUpload.name).get();
    if (!fileSnapshot.empty)
        return undefined;
    const batch = firestore.batch();
    const fileBinary = (0, fileBinaryService_1.createFileBinary)(userId);
    batch.set(fileBinary, {
        id: fileBinary.id,
        binary: fileUpload.data
    });
    const file = createFile(userId);
    const timeStamp = Date.now();
    batch.set(file, {
        id: file.id,
        fileBinaryId: fileBinary.id,
        createdAt: timeStamp,
        updatedAt: timeStamp,
        ...(({ data, mv, ...rest }) => rest)(fileUpload)
    });
    return batch.commit();
};
exports.addFile = addFile;
const updateOrDeleteFile = (userId, fileId) => (0, fileModel_1.default)(userId).doc(fileId);
const updateFileData = async (userId, fileId, fileUpload) => {
    const fileSnapshot = await (0, fileModel_1.default)(userId).doc(fileId).get();
    if (!fileSnapshot.exists)
        return undefined;
    const file = fileSnapshot.data();
    const batch = firestore.batch();
    batch.update((0, fileBinaryService_1.updateOrDeleteFileBinary)(userId, file.fileBinaryId), { binary: fileUpload.data });
    batch.update(updateOrDeleteFile(userId, fileId), {
        ...file,
        size: fileUpload.size,
        encoding: fileUpload.encoding,
        checksum: fileUpload.md5,
        updatedAt: Date.now()
    });
    return batch.commit();
};
exports.updateFileData = updateFileData;
const updateFileName = async (userId, fileId, name) => (0, fileModel_1.default)(userId).doc(fileId).update({ name: name });
exports.updateFileName = updateFileName;
const deleteFile = async (userId, fileId) => {
    const fileSnapshot = await (0, fileModel_1.default)(userId).doc(fileId).get();
    if (!fileSnapshot.exists)
        return undefined;
    const file = fileSnapshot.data();
    const batch = firestore.batch();
    batch.delete((0, fileBinaryService_1.updateOrDeleteFileBinary)(userId, file.fileBinaryId));
    batch.delete(updateOrDeleteFile(userId, fileId));
    return batch.commit();
};
exports.deleteFile = deleteFile;
const getAllFiles = async (userId) => (await (0, fileModel_1.default)(userId).get()).docs.map((snapshot) => snapshot.data());
exports.getAllFiles = getAllFiles;
const getFileByName = async (userId, name) => {
    const fileSnapshot = await (0, fileModel_1.default)(userId).where("name", "==", name).get();
    if (!fileSnapshot.empty)
        return undefined;
    return fileSnapshot.docs[0].data();
};
exports.getFileByName = getFileByName;
const getFileByType = async (userId, type) => {
    const fileSnapshot = await (0, fileModel_1.default)(userId).where("type", "==", type).get();
    if (!fileSnapshot.empty)
        return undefined;
    return fileSnapshot.docs.map((snapshot) => snapshot.data());
};
exports.getFileByType = getFileByType;
//# sourceMappingURL=fileService.js.map