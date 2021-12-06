"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileModel_1 = require("./fileModel");
const fileService_1 = require("./fileService");
const fileBinaryService_1 = require("./binary/fileBinaryService");
const MAX_FILE_SIZE_IN_BYTES = 1_000_000;
const defaultFileUploadConfig = {
    limits: {
        fileSize: MAX_FILE_SIZE_IN_BYTES
    },
    abortOnLimit: true
};
const route = (0, express_1.Router)();
exports.route = route;
const verifyMinizincFile = (req, res, next) => {
    if (!req.files)
        return res.status(400).send("No file were uploaded");
    if (!req.files.minizinc)
        return res.status(400).send("No field value minizinc specified");
    const file = asSingleFile(req.files.minizinc);
    if (!file)
        return res.status(400).send("Multiple files uploaded");
    if (!isMinizincFile(file.name))
        return res.status(400).send("Not a mzn or dzn file");
    res.locals.file = file;
    next();
};
route.post("/", (0, express_fileupload_1.default)(defaultFileUploadConfig), verifyMinizincFile, async (req, res) => {
    const file = res.locals.file;
    const write = await (0, fileService_1.addFile)(req.session.userId, file);
    if (!write)
        return res.status(403).send("File allready exists");
    res.status(201).send(`Successfully uploaded ${file.name}`);
});
route.get("/", async (req, res) => {
    const files = await (0, fileService_1.getAllFiles)(req.session.userId);
    res.send(files);
});
route.get("/:fileBinaryId/binary", async (req, res) => {
    const fileBinary = await (0, fileBinaryService_1.getFileBinaryById)(req.session.userId, req.params.fileBinaryId);
    if (!fileBinary)
        return res.status(400).send("Not found");
    res.send(fileBinary);
});
route.put("/:fileId/data", (0, express_fileupload_1.default)(defaultFileUploadConfig), verifyMinizincFile, async (req, res) => {
    try {
        const update = await (0, fileService_1.updateFileData)(req.session.userId, req.params.fileId, res.locals.file);
        if (!update)
            return res.status(400).send("Failed to update name");
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    res.sendStatus(200);
});
route.put("/:fileId/name", async (req, res) => {
    if (!req.body.name)
        return res.status(400).send("No name value specified");
    try {
        await (0, fileService_1.updateFileName)(req.session.userId, req.params.fileId, req.body.name);
    }
    catch (error) {
        return res.sendStatus(500);
    }
    res.sendStatus(200);
});
route.delete("/:filedId", async (req, res) => {
    try {
        await (0, fileService_1.deleteFile)(req.session.userId, req.params.filedId);
    }
    catch (error) {
        return res.sendStatus(500);
    }
    res.sendStatus(200);
});
const asSingleFile = (upload) => Array.isArray(upload) ? undefined : upload;
const isMinizincFile = (name) => {
    const fileType = (0, fileModel_1.getFileType)(name);
    return fileType === "mzn" || fileType === "dzn";
};
//# sourceMappingURL=fileController.js.map