import { NextFunction, Request, Response, Router } from "express";
import { verifyUserAdminRight } from "../user/userService";
import fileUpload from "express-fileupload";
import { addSolverFile, getAllSolverFiles } from "./solver/file/solverFileService";
import { asSingleFile, defaultFileUploadConfig } from "../config/fileConfig";

const route = Router();

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!await verifyUserAdminRight(req.session.userId!))
        return res.status(403).send("User does not exist or user is not admin.");
    next();
}

route.use(verifyAdmin);

route.get("/solver", async (_, res) => res.send(await getAllSolverFiles()));

route.post("/solver", fileUpload(defaultFileUploadConfig), async (req, res) => {
    if(!req.files)
        return res.status(403).send("File not found!");
    if(!req.files.solverfile)
        return res.status(403).send("Wrong type of file!");
    const file = asSingleFile(req.files.solverfile)
    if (!file)
        return res.status(403).send("You can only upload one file at once.");
    addSolverFile(file);
    res.status(201).send("Successfully uploaded the solver Dockerfile");
});

export default route;


