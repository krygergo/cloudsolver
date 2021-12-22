import { UploadedFile } from "express-fileupload";
import { asSingleFile } from "../config/fileConfig";
import { SolverFlag, SolverFlagCollection } from "./flagFileModel";
import { v4 as uuid } from "uuid";

/**
 * verify files
 */
export const verifyFlagFile = (flagfile: UploadedFile) => {
    const myFlagFile = asSingleFile(flagfile);
    if (!flagfile)
        return { status: false, message: "You can only upload one flagtext file at once." };
    if (flagfile.name.length <= ".txt".length)
        return { status: false, message: "The flag text file must have a name!" };
    if (flagfile.name.slice(flagfile.name.length - ".txt".length) !== "txt")
        return { status: false, message: "The file extension must be .txt" };
    return { status: true, message: "success!" }
}

export const verifySolverFile = (solverFile: UploadedFile) => {
    const mySolverFile = asSingleFile(solverFile);
    if (!mySolverFile)
        return { status: false, message: "You can only upload one solver file at once." };
    if (mySolverFile.name.length <= ".tar.gz".length)
        return { status: false, message: "The solverfile must have a name!" };
    if (mySolverFile.name.slice(mySolverFile.name.length - ".tar.gz".length) !== ".tar.gz")
        return { status: false, message: "The file extension must be .tar.gz" };
    return { status: true, message: "success!" }
}


/**
 * get,update and delete flagfiles
 */
 export const fileByName = (filename: string) => {
    const solvercollection = SolverFlagCollection()
    const query = solvercollection.where("name", "==", filename);

    const getFile = async () => {
        const fileSnapshot = await query.get();
        if(fileSnapshot.empty)
            return undefined;
        return fileSnapshot.docs[0].data()!;
    }

    const updateFileData = async (input: string) => {
        const file = await getFile();
        if(!file)
            return undefined;
        return solvercollection.doc(file.id).update({data : input, updatedAt: Date.now()})
    }

    const deleteFile = async () => {
        const file = await getFile();
        if(!file)
            return undefined;
        return solvercollection.doc(file.id).delete();
    }

    return {
        getFile,
        updateFileData,
        deleteFile
    }
}

export const uploadNewFlagFile = async (flagFile: UploadedFile) => {
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
        return undefined
    return SolverFlagCollection().doc(solverFileId).set(solverFlagFile)
}