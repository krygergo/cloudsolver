import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../../../config/database/googleFirestore";

// The data of a file, was prevously used as a collection with binary data, but changing it to string made some code simpler
export interface FileBinary {
    id: string
    binary: string
}

const fileDataConverter: FirestoreDataConverter<FileBinary> = {
    toFirestore(fileBinary: FileBinary) {
        return fileBinary;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as FileBinary;
    }
}

export const FileBinaryCollection = (userId: string) => firestore()
    .collection("User")
    .doc(userId)
    .collection("FileBinary")
    .withConverter(fileDataConverter);

