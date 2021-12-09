import { UploadedFile } from "express-fileupload";
import collection from "./solverDockerfileModel"

const createSolverDockerfile = () => collection().doc();

export const addSolverDockerfile = async (fileUpload: UploadedFile) => {
    const fileSnapshot = await collection().where("name", "==", fileUpload.name).get();
    if(!fileSnapshot.empty)
        return undefined;
    const doc = createSolverDockerfile();
    collection().add({
        id: doc.id,
        createdAt: Date.now(),
        ...(({mv, ...rest}) => rest)(fileUpload)
    })
    return doc.id
}

export const getAllSolverDockerfiles = async () => (await collection().get()).docs.map((snapshot) => snapshot.data());