import { Request, Response } from "express";
import { Job, JobCollection } from "./jobModel"
import { v4 as uuid } from "uuid";
import collection from "../userModel";
import { getUserById } from "../userService";

export const JobService = (userId: string) => {
    const jobCollection = JobCollection(userId);

    const addJob = async (mznFileId: string, dznFileId: string,memoryMax: number, vCPUMax: number, config: {[key: string]: any} = {}) => {
        const jobId = uuid();
        await jobCollection.doc(jobId).set({
            id: jobId,
            mznFileId: mznFileId,
            dznFileId: dznFileId,
            config: config,
            result: {
                status: "PENDING"
            },
            createdAt: Date.now(),
            memoryMax: memoryMax,
            vCPUMax: vCPUMax
        });
        return jobId;
    }

    const getAllJobs = async () => {
        const jobSnapshot = await jobCollection.get();
        return jobSnapshot.docs.map((job) => job.data());
    }
    
    const getAvailableMemory = async ()  => {
        const memoryMax = (await getUserById(userId))?.memoryMax!;
        const remainingMemoryUsage = (await getAllJobs()).reduce((total:number,nextJob:Job)=>total+nextJob.memoryMax,0)
        return memoryMax - remainingMemoryUsage
    }
    const getAvailablevCPU = async ()  => {
        const vCPUMax = (await getUserById(userId))?.vCPUMax!;
        const remainingvCPUMax = (await getAllJobs()).reduce((total:number,nextJob:Job)=>total+nextJob.vCPUMax,0)
        return vCPUMax - remainingvCPUMax
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
        listenOnChange,
        getAvailableMemory,
        getAvailablevCPU
    }
}
