import { Firestore, FirestoreDataConverter, QueryDocumentSnapshot, Transaction } from "@google-cloud/firestore";
import { readFileSync } from "fs";
import { KubeConfig, BatchV1Api, V1Job } from "@kubernetes/client-node";
import { exit } from "process";

const config = new KubeConfig();
config.loadFromDefault();
const batchApi = config.makeApiClient(BatchV1Api)

export type UserRight = "ADMIN" | "DEFAULT"

export interface User {
    id: string
    username: string
    hashedPassword: string
    userRight: UserRight
    createdAt: number
    vCPUMax: number
    memoryMax: number
}

const userConverter: FirestoreDataConverter<User> = {
    toFirestore(user: User) {
        return user;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as User;
    }
}

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

type Status = "RUNNING" | "FINISHED" | "QUEUED"

const firestore = new Firestore();

const main = async () => {
    const args = process.argv.slice(2);

    const userId = args[0];
    const jobId = args[1];
    const solver = args[2];

    const userDocument = firestore.collection("User").doc(userId);
    const jobCollection = userDocument.collection("Job").withConverter(jobConverter);

    const jobReference = jobCollection.doc(jobId);

    const outputTransaction = await firestore.runTransaction(async transaction => {
        const jobSnapshot = await transaction.get(jobReference);

        if(!jobSnapshot.exists)
            return "Job do not exists";
                
        const job = jobSnapshot.data()!;

        if(job.status === "FINISHED")
            return "The job is allready handled";
                
        const data = readFileSync("/shared/result.txt");

        transaction.update(jobReference, {
            finishedAt: Date.now(),
            status: "FINISHED",
            result: {
                solver: solver,
                output: Buffer.from(data).toString()
            } 
        });
        return "Success";
    });

    if(outputTransaction !== "Success")
        return;

    const joblist = await batchApi.listNamespacedJob("default");
    joblist.body.items.filter(job => job.metadata?.name?.startsWith(jobId) && !job.metadata?.name?.endsWith(solver)).forEach( job => {
        batchApi.deleteNamespacedJob(job.metadata?.name!, "default", undefined, undefined, undefined, undefined, "Background");
    });
        
    const runningJobs = (await jobCollection.where("status", "==", "RUNNING").get()).docs.map(job => job.data());
    const queuedJobs = (await jobCollection.where("status", "==", "QUEUED").get()).docs.map(job => job.data()).sort((aJob, bJob) => aJob.createdAt - bJob.createdAt);
    const jobs = runningJobs.concat(queuedJobs);
    if(jobs.length === 0)
        return;
    const user = (await userDocument.withConverter(userConverter).get()).data()!;
    let availableMemory = user?.memoryMax! - runningJobs.reduce((total: number, nextJob: Job) => total + nextJob.memoryMax, 0);
    let availablevCPU = user?.vCPUMax! - runningJobs.reduce((total: number, nextJob: Job) => total + nextJob.vCPUMax, 0);

    while(queuedJobs.length > 0) {
        const job = queuedJobs.pop()!;
        if(job.memoryMax <= availableMemory && job.vCPUMax <= availablevCPU) {
            jobCollection.doc(job.id).update({
                status: "RUNNING"
            })
            job.solvers.forEach(solver => batchApi.createNamespacedJob("default", solverPodJob(
                userId, job.id, solver, job.memoryMax / job.solvers.length, job.vCPUMax / job.solvers.length
            )));
            availablevCPU -= job.vCPUMax;
            availableMemory -= job.memoryMax;
        } else {
            break;
        }
    }
}

main();

const solverPodJob = (userId: string, jobId: string, solver: string,memoryMax: number,vCPUMax: number): V1Job => ({
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
        name: `${jobId}-${solver}`
    },
    spec: {
        template: {
            spec: {
                initContainers: [{
                    name: "fileinput",
                    image: "europe-north1-docker.pkg.dev/cloudsolver-334113/solver/input",
                    command: [
                        "node"
                    ],
                    args: [
                        "app.js",
                        userId,
                        jobId
                    ],
                    env: [{
                        name: "GOOGLE_APPLICATION_CREDENTIALS",
                        value: "/keys/google-api-key.json"
                    }],
                    volumeMounts: [{
                        name: "shared-data",
                        mountPath: "/shared",
                    }, {
                        name: "keys",
                        mountPath: "/keys",
                        readOnly: true
                    }]
                }, {
                    name: "minizinc",
                    image: `eu.gcr.io/cloudsolver-334113/${solver}`,
                    resources: {
                        limits: {
                            memory:`${memoryMax}Mi`,
                            cpu: `${vCPUMax}m`
                        }
                    },
                    command: [
                        "minizinc"
                    ],
                    args: [
                        "/shared/config.mpc",
                        "/shared/mznFile.mzn",
                        "/shared/dznFile.dzn",
                    ],
                    volumeMounts: [{
                        name: "shared-data",
                        mountPath: "/shared",
                    }]
                }],
                containers: [{
                    name: "fileoutput",
                    image: "europe-north1-docker.pkg.dev/cloudsolver-334113/solver/output",
                    command: [
                        "node"
                    ],
                    args: [
                        "app.js",
                        userId,
                        jobId,
                        solver
                    ],
                    env: [{
                        name: "GOOGLE_APPLICATION_CREDENTIALS",
                        value: "/keys/google-api-key.json"
                    }],
                    volumeMounts: [{
                        name: `shared-data`,
                        mountPath: "/shared",
                    }, {
                        name: "keys",
                        mountPath: "/keys",
                        readOnly: true
                    }]
                }],
                volumes: [{
                    name: "shared-data"
                }, {
                    name: "keys",
                    secret: {
                        secretName: "google-api-key"
                    }
                }],
                restartPolicy: "Never"
            }
        },
        activeDeadlineSeconds: 60 * 5, // Must finish within 5min
        ttlSecondsAfterFinished: 0
    }
});