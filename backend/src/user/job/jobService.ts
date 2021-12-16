import { Request, Response } from "express";
import { JobCollection } from "./jobModel"
import { v4 as uuid } from "uuid";

export const JobService = (userId: string) => {
    const jobCollection = JobCollection(userId);

    const addJob = async (mznFileId: string, dznFileId: string, config: {[key: string]: any} = {}) => {
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

    return {
        addJob,
        getAllJobs,
        listenOnChange
    }
}
