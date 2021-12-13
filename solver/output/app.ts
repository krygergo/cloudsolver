import { Firestore, FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { readFile } from "fs";

const jobConverter: FirestoreDataConverter<Job> = {
    toFirestore(job: Job) {
        return job;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as Job;
    }
}


interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    result: Result
}

interface Result {
    status: Status
    output: string
}

type Status = "FAILED" | "RUNNING" | "SUCCESS"

const firestore = new Firestore();

const main = async () => {
    const args = process.argv.slice(2);

    const userId = args[0];
    const jobId = args[1];

    readFile("/shared/result.txt", (error, data) => {
        if(error)
            throw error;
        
        firestore.collection("User").doc(userId).collection("Job").withConverter(jobConverter).doc(jobId).update({
            result: {
                status: "SUCCESS",
                output: Buffer.from(data).toString()
            }
        });
    });
}

main();