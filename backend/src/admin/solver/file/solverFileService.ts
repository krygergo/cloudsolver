import { UploadedFile } from "express-fileupload";
import collection from "./solverFileModel"

const createSolverFile = () => collection().doc();

export const addSolverFile = async (fileUpload: UploadedFile) => {
    const fileSnapshot = await collection().where("name", "==", fileUpload.name).get();
    if(!fileSnapshot.empty)
        return undefined;
    const doc = createSolverFile();
    collection().add({
        id: doc.id,
        createdAt: Date.now(),
        ...(({mv, ...rest}) => rest)(fileUpload)
    })
    return doc.id
}

export const getAllSolverFiles = async () => (await collection().get()).docs.map((snapshot) => snapshot.data());