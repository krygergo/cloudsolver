import { Request, Response } from "express";
import { JobCollection } from "./jobModel"
import { v4 as uuid } from "uuid";

export const JobService = (userId: string) => {
    const jobCollection = JobCollection(userId);

    const addJob = async (mznFileId: string, dznFileId: string, config: {key: string, value: any}[] = []) => {
        const jobId = uuid();
        await jobCollection.doc(jobId).set({
            id: jobId,
            mznFileId: mznFileId,
            dznFileId: dznFileId,
            config: config,
            result: {
                status: "PENDING"
            },
            createdAt: Date.now()
        });
        return jobId;
    }

    const getAllJobs = async () => {
        const jobSnapshot = await jobCollection.get();
        return jobSnapshot.docs.map((job) => job.data());
    }

    const listenOnChange = (req: Request, res: Response) => {
        const unsub = jobCollection.onSnapshot(snapshot => {
            console.log(snapshot.docs.map(doc => doc.data()));
        });
        req.once("close", () => {
            console.log("\nCLOSING\n");
            unsub();
            res.end();
        })
    }

    return {
        addJob,
        getAllJobs,
        listenOnChange
    }
}
