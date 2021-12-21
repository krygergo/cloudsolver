import { NextFunction, Request, Response, Router } from "express";
import { deleteUserById, updateUserResourcesById, verifyUserAdminRight } from "../user/userService";
import fileUpload from "express-fileupload";
import { addSolverFile } from "../solver/file/solverFileService";
import { asSingleFile, defaultFileUploadConfig } from "../config/fileConfig";
import { auth } from "../auth/auth";

const route = Router();

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!await verifyUserAdminRight(req.session.userId!))
        return res.status(403).send("User does not exist or user is not admin.");
    next();
}

route.use(verifyAdmin);

/**
 * Endpoint for deleting a user.
 */
route.delete("/user/:userId", auth, (req, res) => {
    deleteUserById(req.params.userId);
    res.sendStatus(200);
});

/**
 * Endpoint for updating a user's maximum amount of vCPUs and memory
 */
route.put("/user/:userId", async (req, res) => {
    if(!req.body.vCPUMax && !req.body.memoryMax)
        return res.status(400).send("No vCPUMax or memoryMax specified");

    const updated = await updateUserResourcesById(req.params.userId, req.body.vCPUMax, req.body.memoryMax);
    updated ? res.sendStatus(200): res.sendStatus(400);
});

/**
 * Endpoint for adding a new solver to the platform
 */
route.post("/solver", fileUpload(defaultFileUploadConfig), async (req, res) => {
    if(!req.files)
        return res.status(404).send("File not found!");
    if(!req.files.solverfile)
        return res.status(400).send("Wrong type of file!");
    const file = asSingleFile(req.files.solverfile);
    if(!file)
        return res.status(400).send("You can only upload one file at once.");
    if(file.name.length <= ".tar.gz".length)
        return res.status(400).send("The solver must have a name!");
    if(file.name.slice(file.name.length-".tar.gz".length) !== ".tar.gz")
        return res.status(415).send("The file extension must be .tar.gz.");
    if(!await addSolverFile(file))
        return res.status(400).send("The file already exists or an unexpected error occured.");
    return res.status(201).send("Successfully uploaded the solverfile.");
});

export default route;