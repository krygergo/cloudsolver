import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../../../config/database/googleFirestore";

export interface FileBinary {
    id: string
    binary: Buffer
}

const fileDataConverter: FirestoreDataConverter<FileBinary> = {
    toFirestore(fileBinary: FileBinary) {
        return fileBinary;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as FileBinary;
    }
}

export default (userId: string) => firestore()
    .collection("User")
    .doc(userId)
    .collection("FileBinary")
    .withConverter(fileDataConverter);

