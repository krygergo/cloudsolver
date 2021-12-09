import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { UploadedFile } from "express-fileupload";
import firestore from "../../../config/database/googleFirestore";

export interface SolverFile extends Omit<UploadedFile, "mv"> {
    id: string
    createdAt: number
}

const solverDockerfileConverter: FirestoreDataConverter<SolverFile> = {
    toFirestore(file: SolverFile) {
        return file;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as SolverFile;
    }
}

export default () => firestore()
    .collection("SolverDockerfile")
    .withConverter(solverDockerfileConverter);
