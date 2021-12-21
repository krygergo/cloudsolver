import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../../config/database/googleFirestore";

/**
 * This interface is for type safety during upload of jobs.
 * When downloading a job from firestore it will come in this format also.
 */
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


/**
 * Function that converts an object to the format specified in the job interface.
 */
const jobConverter: FirestoreDataConverter<Job> = {
    toFirestore(job: Job) {
        return job;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as Job;
    }
}

/**
 * Get a specific users job collection.
 */
export const JobCollection = (userId: string) => firestore()
    .collection("User")
    .doc(userId)
    .collection("Job")
    .withConverter(jobConverter);