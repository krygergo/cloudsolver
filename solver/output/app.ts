import { Firestore, FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { readFileSync } from "fs";
import { KubeConfig, BatchV1Api } from "@kubernetes/client-node";

const config = new KubeConfig();
config.loadFromDefault();
const batchApi = config.makeApiClient(BatchV1Api)

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
    finishedAt?: number
}

interface Result {
    status: Status
    solver?: string
    output?: string
}

type Status = "PENDING" | "FINISHED"

const firestore = new Firestore();

const main = async () => {
    const args = process.argv.slice(2);

    const userId = args[0];
    const jobId = args[1];
    const solver = args[2];

    const jobReference = firestore.collection("User").doc(userId).collection("Job").doc(jobId).withConverter(jobConverter);

    try {
        const transaction = await firestore.runTransaction(async transaction => {
            const jobSnapshot = await transaction.get(jobReference);

            if(!jobSnapshot.exists)
                return Promise.reject("Job do not exists");
                
            const job = jobSnapshot.data()!;

            if(job.result.status === "FINISHED")
                return Promise.reject("The job is allready handled");
                
            const data = readFileSync("/shared/result.txt");

            transaction.update(jobReference, {
                finishedAt: Date.now(),
                result: {
                    status: "FINISHED",
                    solver: solver,
                    output: Buffer.from(data).toString()
                } 
            });
            return Promise.resolve("Success");
        });

        if(transaction !== "Success")
            return;
            
        const joblist = await batchApi.listNamespacedJob("default");
        joblist.body.items.filter(job => job.metadata?.name?.startsWith(jobId) && !job.metadata?.name?.endsWith(solver)).forEach( job => {
            batchApi.deleteNamespacedJob(job.metadata?.name!, "default", undefined, undefined, undefined, undefined, "Background");
        })

    } catch(error) {
        console.log(error);
    }
}

main();