import { NextFunction, Request, Response, Router } from "express";
import fileUpload from "express-fileupload";
import { getFileType } from "./fileModel";
import { FileService } from "./fileService";
import { FileBinaryService } from "./binary/fileBinaryService";
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
    const fileService = FileService(req.session.userId!);
    const fileBinaryService = FileBinaryService(req.session.userId!);
    
    const route = Router();

    route.post("/", fileUpload(defaultFileUploadConfig), verifyMinizincFile, async (_, res) => {
        const file = res.locals.file!;
        if(file.size === 0)
            return res.status(400).send("Empty file");
        const write = await fileService.addFile(file);
        if(!write)
            return res.status(403).send("File allready exists");
        res.status(201).send(`Successfully uploaded ${file.name}`);
    });

    route.get("/", async (_, res) => res.send(await fileService.getAllFiles()));

    route.get("/name/:name", async (req, res) => {
        const file = await fileService.fileByName(req.params.name).get();
        if(!file)
            return res.status(400).send("File do not exists");
        return res.send(file);
    })

    route.get("/name/listen/:name", (req, res) => fileService.fileByName(req.params.name).listenOnChange(req, res));

    route.get("/binary/:fileBinaryId", async (req, res) => {
        const fileBinary = await fileBinaryService.getFileBinaryById(req.params.fileBinaryId);
        if(!fileBinary)
            return res.status(400).send("Not found");
        res.send(fileBinary);
    });

    route.put("/binary/:fileId", async (req, res) => {
        if(!req.body.binary)
            return res.status(400).send("No binary data provided");
        if(!await fileService.fileById(req.params.fileId).updateFileData(req.body.binary))
            return res.status(400).send("File do not exists");
        res.sendStatus(200);        
    });

    route.put("/name/:fileId", async (req, res) =>{
        if(!req.query.name)
            return res.status(400).send("No query parameter name specified");
        if(!await fileService.fileById(req.params.fileId).updateFileName(req.query.name as string))
            return res.status(400).send("File do not exists");
        res.sendStatus(200);
    });

    route.delete("/:filedId", async (req, res) => {
        if(!await fileService.fileById(req.params.filedId).deleteFile())
            return res.status(400).send("Unable to delete");
        res.sendStatus(200);
    })

    return route(req, res, next);
}
