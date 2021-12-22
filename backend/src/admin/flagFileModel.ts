import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../config/database/googleFirestore";

export interface SolverFlag {
    id: string
    name: string
    data: string
    size: number
    createdAt: number
    updatedAt: number
}

const solverConverter: FirestoreDataConverter<SolverFlag> = {
    toFirestore(SolverFlag: SolverFlag) {
        return SolverFlag;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as SolverFlag;
    }
}

export const SolverFlagCollection = () => firestore()
    .collection("SolverFlag")
    .withConverter(solverConverter);
