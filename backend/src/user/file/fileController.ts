import { NextFunction, Request, Response, Router } from "express";
import fileUpload from "express-fileupload";
import { getFileType } from "./fileModel";
import fileService from "./fileService";
import fileBinaryService from "./binary/fileBinaryService";
import { asSingleFile, defaultFileUploadConfig } from "../../config/fileConfig";

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

const isMinizincFile = (name: string) =>  {
    const fileType = getFileType(name);
    return fileType === "mzn" || fileType === "dzn";
}

export default (req: Request, res: Response, next: NextFunction) => {
    const fileSvc = fileService(req.session.userId!);
    const fileBinarySvc = fileBinaryService(req.session.userId!);
    
    const route = Router();

    route.post("/", fileUpload(defaultFileUploadConfig), verifyMinizincFile, async (_, res) => {
        const file = res.locals.file!;
        const write = await fileSvc.addFile(file);
        if(!write)
            return res.status(403).send("File allready exists");
        res.status(201).send(`Successfully uploaded ${file.name}`);
    });

    route.get("/", async (_, res) => res.send(await fileSvc.getAllFiles()));

    route.get("/name/:name", async (req, res) => {
        const file = await fileSvc.fileByName(req.params.name).get();
        if(!file)
            return res.status(400).send("File do not exists");
        return res.send(file);
    })

    route.get("/name/listen/:name", (req, res) => fileSvc.fileByName(req.params.name).listenOnChange(res as Response));

    route.get("/binary/:fileBinaryId", async (req, res) => {
        const fileBinary = await fileBinarySvc.getFileBinaryById(req.params.fileBinaryId);
        if(!fileBinary)
            return res.status(400).send("Not found");
        res.send(fileBinary);
    });

    route.put("/binary/:fileId", fileUpload(defaultFileUploadConfig), verifyMinizincFile, async (req, res) => {
        if(!await fileSvc.fileById(req.params.fileId).updateFileData(res.locals.file!))
            return res.status(400).send("File do not exists");
        res.sendStatus(200);        
    });

    route.put("/name/:fileId", async (req, res) =>{
        if(!req.query.name)
            return res.status(400).send("No query parameter name specified");
        if(!await fileSvc.fileById(req.params.fileId).updateFileName(req.query.name as string))
            return res.status(400).send("File do not exists");
        res.sendStatus(200);
    });

    route.delete("/:filedId", async (req, res) => {
        if(!await fileSvc.fileById(req.params.filedId).deleteFile())
            return res.status(400).send("Unable to delete");
        res.sendStatus(200);
    })

    return route(req, res, next);
}
