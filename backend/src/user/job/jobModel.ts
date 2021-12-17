import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../../config/database/googleFirestore";

export interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    config: {[key: string]: any}
    result?: Result
    createdAt: number
    finishedAt?: number
    memoryMax: number
    vCPUMax: number
    solvers: string[]
    status: Status
}

interface Result {
    solver: string
    output: string
}

export type Status = "RUNNING" | "FINISHED" | "QUEUED"

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