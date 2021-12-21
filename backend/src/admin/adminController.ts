import { NextFunction, Request, Response, Router } from "express";
import { deleteUserById, updateUserResourcesById, verifyUserAdminRight } from "../user/userService";
import fileUpload from "express-fileupload";
import { addSolverFile } from "../solver/file/solverFileService";
import { asSingleFile, defaultFileUploadConfig } from "../config/fileConfig";
import { auth } from "../auth/auth";
import { UploadedFile } from "express-fileupload"
import firestore from "../config/database/googleFirestore";
import { SolverFlagCollection } from "./flagFileModel";
import { v4 as uuid } from "uuid";
import { SolverService } from "../solver/solverService";

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
    if (!req.body.vCPUMax && !req.body.memoryMax)
        return res.status(400).send("No vCPUMax or memoryMax specified");

    const updated = await updateUserResourcesById(req.params.userId, req.body.vCPUMax, req.body.memoryMax);
    updated ? res.sendStatus(200) : res.sendStatus(400);
});
/**
 * get,update and delete flagfiles
 */
const fileByName = (filename: string) => {
    const solvercollection = SolverFlagCollection()
    const query = solvercollection.where("name", "==", filename);
    //const document = SolverFlagCollection().doc(filename);

    const getFile = async () => {
        const fileSnapshot = await query.get();
        if(!fileSnapshot.empty)
            return undefined;
        return fileSnapshot.docs[0].data()!;
    }

    const updateFileData = async (input: string) => {
        const file = await getFile();
        if(!file)
            return undefined;
        return solvercollection.doc(file.id).update({data : input})
    }
/**
 * verify files
 */

const verifyFlagFile = (flagfile: UploadedFile) => {
    const myFlagFile = asSingleFile(flagfile);
    if (!flagfile)
        return { status: false, message: "You can only upload one flagtext file at once." };
    if (flagfile.name.length <= ".txt".length)
        return { status: false, message: "The flag text file must have a name!" };
    if (flagfile.name.slice(flagfile.name.length - ".txt".length) !== "txt")
        return { status: false, message: "The file extension must be .txt" };
    return { status: true, message: "success!" }
}
const verifySolverFile = (solverFile: UploadedFile) => {
    const mySolverFile = asSingleFile(solverFile);
    if (!mySolverFile)
        return { status: false, message: "You can only upload one solver file at once." };
    if (mySolverFile.name.length <= ".txt".length)
        return { status: false, message: "The solverfile must have a name!" };
    if (mySolverFile.name.slice(mySolverFile.name.length - ".tar.gz".length) !== ".tar.gz")
        return { status: false, message: "The file extension must be .tar.gz" };
    return { status: true, message: "success!" }
}

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
    if (!await addSolverFile(solverFile!))
        return res.status(400).send("The file already exists or an unexpected error occured.");
    const solverFileId = uuid()
    const solverFlagFile = {
        id: solverFileId,
        name: flagFile!.name,
        data: flagFile!.data.toString(),
        size: flagFile!.size,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
    const flagSnapshot = await SolverFlagCollection().where("name", "==", solverFlagFile.name).get();
    if(!flagSnapshot.empty)
        return res.status(400).send("The file already exists or an unexpected error occured.");
    SolverFlagCollection().doc(solverFileId).set(solverFlagFile)
    return res.status(201).send("Successfully uploaded the solverfile & flagfile.");
});

route.get("/solverflag",)


export default route;