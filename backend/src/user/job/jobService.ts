import { Request, Response } from "express";
import { Job, JobCollection, Status } from "./jobModel"
import { v4 as uuid } from "uuid";
import { Transaction } from "@google-cloud/firestore";

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
            res.write(`data: ${JSON.stringify(snapshot.docs.map(doc => doc.data()))}`);
            res.write("\n\n");
        });
        req.once("close", () => {
            unsub();
            res.end();
        });
    }

    const deleteJob = (jobId: string) => jobCollection.doc(jobId).delete();

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
