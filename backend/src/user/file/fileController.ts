import { NextFunction, Request, Response, Router } from "express";
import fileUpload, { UploadedFile, Options } from "express-fileupload";
import { getFileType } from "./fileModel";
import { addFile, deleteFile, getAllFiles, getFileByName, sendFileByNameListen, updateFileData, updateFileName } from "./fileService";
import { getFileBinaryById } from "./binary/fileBinaryService";

const MAX_FILE_SIZE_IN_BYTES = 1_000_000

const defaultFileUploadConfig: Options = {
    limits: {
        fileSize: MAX_FILE_SIZE_IN_BYTES
    },
    abortOnLimit: true
}

const route = Router();

const verifyMinizincFile = (req: Request, res: Response, next: NextFunction) => {
    if(!req.files)
        return res.status(400).send("No file were uploaded");
    if(!req.files.minizinc)
        return res.status(400).send("No field value minizinc specified");
    const file = asSingleFile(req.files.minizinc);
    if(!file)
        return res.status(400).send("Multiple files uploaded");
    if(!isMinizincFile(file.name))
        return res.status(400).send("Not a mzn or dzn file");
    res.locals.file = file;
    next();
}

route.post("/", fileUpload(defaultFileUploadConfig), verifyMinizincFile, async (req, res) => {
    const file = res.locals.file!;
    const write = await addFile(req.session.userId!, file);
    if(!write)
        return res.status(403).send("File allready exists");
    res.status(201).send(`Successfully uploaded ${file.name}`);
});

route.get("/", async (req, res) => {
    const files = await getAllFiles(req.session.userId!);
    res.send(files);
});

route.get("/:name/name", async (req, res) => {
    const file = await getFileByName(req.session.userId!, req.params.name);
    res.send(file);
})

route.get("/:name/name/listen", async (req, res) => sendFileByNameListen(
    req.session.userId!, req.params.name, res as Response
));

route.get("/:fileBinaryId/binary", async (req, res) => {
    const fileBinary = await getFileBinaryById(req.session.userId!, req.params.fileBinaryId);
    if(!fileBinary)
        return res.status(400).send("Not found");
    res.send(fileBinary);
});

route.put("/:fileId/data", fileUpload(defaultFileUploadConfig), verifyMinizincFile, async (req, res) => {
    try {
        const update = await updateFileData(req.session.userId!, req.params.fileId, res.locals.file!);
        if(!update)
            return res.status(400).send("Failed to update name");
    } catch(error) {
        console.log(error);
        return res.sendStatus(500);
    }
    res.sendStatus(200);
});

route.put("/:fileId/name", async (req, res) => {
    if(!req.body.name)
        return res.status(400).send("No name value specified");
    try {
        await updateFileName(req.session.userId!, req.params.fileId, req.body.name);
    } catch(error) {
        return res.sendStatus(500);
    }
    res.sendStatus(200);
});

route.delete("/:filedId", async (req, res) => {
    try {
        await deleteFile(req.session.userId!, req.params.filedId);
    } catch(error) {
        return res.sendStatus(500);
    }
    res.sendStatus(200);
})

const asSingleFile = (upload: UploadedFile | UploadedFile[]) => 
    Array.isArray(upload) ? undefined : upload as UploadedFile;

const isMinizincFile = (name: string) =>  {
    const fileType = getFileType(name);
    return fileType === "mzn" || fileType === "dzn";
}

export { route }
