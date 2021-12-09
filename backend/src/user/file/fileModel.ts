import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { UploadedFile } from "express-fileupload";
import firestore from "../../config/database/googleFirestore";

export type FileType = "mzn" | "dzn"

export interface File extends Omit<UploadedFile, "data" | "mv"> {
    id: string
    fileBinaryId: string
    createdAt: number
    updatedAt: number
}

const fileConverter: FirestoreDataConverter<File> = {
    toFirestore(file: File) {
        return file;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as File;
    }
}

export const getFileType = (name: string): FileType | undefined => {
    const fileType = name.slice(name.length - 3);
    if(fileType === "mzn")
        return "mzn";
    if(fileType === "dzn")
        return "dzn";
    return undefined;
}

export default (userId: string) => firestore()
    .collection("User")
    .doc(userId)
    .collection("File")
    .withConverter(fileConverter);
