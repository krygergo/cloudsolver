import { Firestore, FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { readFile, readFileSync } from "fs";

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
    flags: string
    result: Result
    createdAt: number
}

interface Result {
    status: Status
    solver: string
    output: string
}

type Status = "FAILED" | "PENDING" | "SUCCESS"

const firestore = new Firestore();

const main = async () => {
    const args = process.argv.slice(2);

    const userId = args[0];
    const jobId = args[1];

    const jobReference = firestore.collection("User").doc(userId).collection("Job").doc(jobId).withConverter(jobConverter);

    try {
        const transaction = await firestore.runTransaction(async (transaction) => {
            const jobSnapshot = await transaction.get(jobReference);

            if(!jobSnapshot.exists)
                return undefined;
                
            const job = jobSnapshot.data()!;

            if(job.result.status !== "PENDING")
                return undefined;
                
            const data = readFileSync("/shared/result.txt");

            transaction.update(jobReference, {
                result: {
                    status: "SUCCESS",
                    output: Buffer.from(data).toString()
                } 
            });
            return true;
        });
        if(!transaction)
            return;
        
        //todo terminate other pods if there are multiple pods running this job
    } catch(error) {
        console.log(error);
    }
}

main();