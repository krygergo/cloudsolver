import { NextFunction, Request, Response, Router } from "express";
import { deleteUserById, updateUserResourcesById, verifyUserAdminRight } from "../user/userService";
import fileUpload from "express-fileupload";
import { addSolverFile } from "../solver/file/solverFileService";
import { asSingleFile, defaultFileUploadConfig } from "../config/fileConfig";
import { auth } from "../auth/auth";
import { SolverFlagCollection } from "./flagFileModel";
import { v4 as uuid } from "uuid";
import { verifySolverFile, verifyFlagFile, fileByName, uploadNewFlagFile } from "./flagFileService";
import { ArtifactRegistryService } from "../google/artifactRegistryService";

const route = Router();

const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

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
    if (!req.body.vCPUMax && !req.body.memoryMax)
        return res.status(400).send("No vCPUMax or memoryMax specified");

    const updated = await updateUserResourcesById(req.params.userId, req.body.vCPUMax, req.body.memoryMax);
    updated ? res.sendStatus(200) : res.sendStatus(400);
});

/**
 * Endpoint for adding a new solver to the platform
 */
route.post("/solver", fileUpload(defaultFileUploadConfig), async (req, res) => {
    if (!req.files)
        return res.status(404).send("File not found!");
    if (!req.files.solverfile || !req.files.flagfile)
        return res.status(400).send("Wrong type of file!");
    const solverFile = asSingleFile(req.files.solverfile);
    const flagFile = asSingleFile(req.files.flagfile);
    const verifiedSolverFile = verifySolverFile(solverFile!);
    const verifiedFlagFile = verifyFlagFile(flagFile!);
    if (!verifiedFlagFile.status)
        return res.status(400).send(verifiedFlagFile.message);
    if (!verifiedSolverFile.status)
        return res.status(400).send(verifiedSolverFile.message);

    const namesMatch = solverFile!.name.slice(0, -".tar.gz".length) === flagFile!.name.slice(0, -".txt".length);
  
    
    if(!namesMatch)
        return res.status(400).send("Names of the files must match");

    if (!await addSolverFile(solverFile!))
        return res.status(400).send("The file already exists or an unexpected error occured.");

    const uploaded = await uploadNewFlagFile(flagFile!);
    if(!uploaded)
        return res.status(400).send("Could not upload flag file");
    return res.status(201).send("Successfully uploaded the solverfile & flagfile.");
});

/**
 * Endpoint for retrieving a flag file
 */
route.get("/:solverName/flagFile", async (req, res) => {
    const flagFile = await fileByName(req.params.solverName).getFile();
    if(!flagFile)
        return res.status(404).send("Solver not supported");
    return res.send(flagFile);
})

/**
 * Endpoint for updating the data of an existing flag file
 */
route.put("/:solverName/flagFile", async (req, res) => {
    const newData = req.body.data;
    if(!newData)
        return res.status(400).send("No data specified");

    const fileExists = await fileByName(req.params.solverName).getFile();
    if(!fileExists)
        return res.status(404).send("Flag file does not exist");

    const updated = await fileByName(req.params.solverName).updateFileData(newData);
    if(!updated)
        return res.status(400).send("Something went wrong when updating the file");

    return res.status(200).send("Successfully updated the file");
})

/**
 * Endpoint for deleting a solver and its flag file
 */
route.delete("/:solverName", async (req, res) => {
    // can not delete flag files for existing solvers. To avoid a solver without a flag file
    const images = await artifactRegistryService.getAllImages();
    if(images.includes(req.params.solverName))
        return res.status(400).send("Cannot remove flag file for an existing solver");

    const deleted = await fileByName(req.params.solverName).deleteFile();
    if(!deleted)
        return res.status(400).send("Flag file could not be deleted");
    return res.status(200).send("Solver deleted");
})

route.post("/:solverName/flagFile", fileUpload(defaultFileUploadConfig) , async (req, res) => {
    if(!req.files)
        return res.status(400).send("No files specified");

    const flagFile = asSingleFile(req.files.flagFile);
    if(!flagFile)
        return res.status(400).send("You must specifiy exactly one flag file");

    flagFile.name = flagFile.name.slice(0, -".txt".length);
    const uploaded = await uploadNewFlagFile(flagFile);
    if(!uploaded)
        return res.status(400).send("Could not upload the flag file");

    return res.status(200).send("Flag file uploaded");
})

export default route;