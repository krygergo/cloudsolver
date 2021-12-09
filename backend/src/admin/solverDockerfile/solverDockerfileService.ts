import { UploadedFile } from "express-fileupload";
import { isAdmin } from "../../user/userModel"
import collection from "./solverDockerfileModel"
import firestore from "../../config/googleFirestore";


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