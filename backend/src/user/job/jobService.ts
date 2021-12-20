import { Request, Response } from "express";
import { Job, JobCollection, Status } from "./jobModel"
import { v4 as uuid } from "uuid";
import { Transaction } from "@google-cloud/firestore";
import { getUserById } from "../userService";
import firestore from "../../config/database/googleFirestore";
import { solverPodJob } from "../../solver/solverService";
import k8s from "../../config/kubernetes";

export const createJob = (mznFileId: string, dznFileId: string, memoryMax: number, vCPUMax: number, solvers: string[],
    config: {[key: string]: any} = {}, status: Status = "RUNNING"): Job => {
    const jobId = uuid();
    return {
        id: jobId,
        mznFileId: mznFileId,
        dznFileId: dznFileId,
        config: config,
        status: status,
        createdAt: Date.now(),
        memoryMax: memoryMax,
        vCPUMax: vCPUMax,
        solvers: solvers
    };
}

export const JobService = (userId: string) => {
    const jobCollection = JobCollection(userId);

    const getAllJobs = async () => {
        const jobSnapshot = await jobCollection.get();
        return jobSnapshot.docs.map((job) => job.data());
    }

    const getAllActiveJobs = async () => (await jobCollection
        .where("status", "!=", "FINISHED")
        .get()).docs.map(job => job.data());

    const listenOnChange = async (req: Request, res: Response) => {
        res.writeHead(200, {
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive"
        });
        const unsub = jobCollection.onSnapshot(snapshot => {
            res.write(`data: ${JSON.stringify(snapshot.docChanges().map(change => {
                return {type: change.type, job: change.doc.data()};
            }))}`);
            res.write("\n\n");
        });
        req.once("close", () => {
            unsub();
            res.end();
        });
    }

    const deleteJob = (jobId: string) => {
        jobCollection.doc(jobId).delete();
        handleQueuedJobs();
    }

    const handleQueuedJobs = async () => {
        const user = (await getUserById(userId))!;
        while(true) {
            const job = await firestore().runTransaction(async transaction => {
                const queuedJobSnapshot = await transaction.get(jobCollection.where("status", "==", "QUEUED"));
                if(queuedJobSnapshot.empty)
                    return undefined;
                const nextJob = queuedJobSnapshot.docs.sort((aJob, bJob) => aJob.data().createdAt - bJob.data().createdAt)[0].data();
                const runningJobSnapshot = await transaction.get(jobCollection.where("status", "==", "RUNNING"));
                const runningJobs = runningJobSnapshot.docs.map(job => job.data());
                const availableMemory = user?.memoryMax! - runningJobs.reduce((total: number, nextJob: Job) => total + nextJob.memoryMax, 0);
                const availablevCPU = user?.vCPUMax! - runningJobs.reduce((total: number, nextJob: Job) => total + nextJob.vCPUMax, 0);
                if(nextJob.memoryMax > availableMemory || nextJob.vCPUMax > availablevCPU)
                    return undefined;
                transaction.update(jobCollection.doc(nextJob.id), {
                    status: "RUNNING"
                });
                return nextJob;                
            });
            if(!job)
                break;
            job.solvers.forEach(solver => k8s().batchApi.createNamespacedJob("default", solverPodJob(
                userId, job.id, solver, job.memoryMax / job.solvers.length, job.vCPUMax / job.solvers.length
            )));
        }
    }

    const withTransactions = (transaction: Transaction) => {
        
        const addJob = (job: Job) => transaction.create(jobCollection.doc(job.id), job);

        const queuedAndRunningJobsQuery = async () => {
            const runningJobs = await transaction.get(jobCollection.where("status", "==", "RUNNING"));
            const queuedJobs = await transaction.get(jobCollection.where("status", "==", "QUEUED"));
            return runningJobs.docs.map(job => job.data()).concat(queuedJobs.docs.map(job => job.data()));
        }

        return {
            addJob,
            queuedAndRunningJobsQuery
        }
    }

    return {
        getAllJobs,
        listenOnChange,
        getAllActiveJobs,
        withTransactions,
        deleteJob
    }
}
