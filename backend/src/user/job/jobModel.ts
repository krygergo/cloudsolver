import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../../config/database/googleFirestore";

export interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    flags?: string
    result: Result
    createdAt: number
}

interface Result {
    status: Status
    solver?: string
    output?: string
}

type Status = "FAILED" | "PENDING" | "SUCCESS"

const jobConverter: FirestoreDataConverter<Job> = {
    toFirestore(job: Job) {
        return job;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as Job;
    }
}

export const JobCollection = (userId: string) => firestore()
    .collection("User")
    .doc(userId)
    .collection("Job")
    .withConverter(jobConverter);
