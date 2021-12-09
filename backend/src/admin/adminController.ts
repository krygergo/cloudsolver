import { NextFunction, Request, Response, Router } from "express";
import { verifyUserAdminRight } from "../user/userService";
import fileUpload from "express-fileupload";
import { addSolverDockerfile, getAllSolverDockerfiles } from "./solverDockerfile/solverDockerfileService";
import { asSingleFile, defaultFileUploadConfig } from "../config/fileConfig";

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!await verifyUserAdminRight(req.session.userId!))
        return res.status(403).send("User does not exist or user is not admin.");
    next();
}

const route = Router();

route.use(verifyAdmin);

route.get("/solver", async (_, res) => res.send(await getAllSolverDockerfiles()));

route.post("/solver", fileUpload(defaultFileUploadConfig), async (req, res) => {
    if(!req.files)
        return res.status(403).send("File not found!");
    if(!req.files.solverDockerfile)
        return res.status(403).send("Wrong type of file!");
    const file = asSingleFile(req.files.solverDockerfile)
    if (!file)
        return res.status(403).send("You can only upload one file at once.");
    addSolverDockerfile(file);
    res.status(201).send("Successfully uploaded the solver Dockerfile");
});

export { route };


