import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { UploadedFile } from "express-fileupload";
import firestore from "../../config/googleFirestore";


export interface SolverDockerfile extends Omit<UploadedFile, "mv"> {
    id: string
    createdAt: number
}

const solverDockerfileConverter: FirestoreDataConverter<SolverDockerfile> = {
    toFirestore(file: SolverDockerfile) {
        return file;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as SolverDockerfile;
    }
}

export default () => firestore()
    .collection("SolverDockerfile")
    .withConverter(solverDockerfileConverter);
