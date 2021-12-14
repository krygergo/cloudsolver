import { JobCollection } from "./jobModel"
import { v4 as uuid } from "uuid";

export const JobService = (userId: string) => {
    const jobCollection = JobCollection(userId);

    const addJob = async (mznFileId: string, dznFileId: string, flags: string) => {
        const jobId = uuid();
        await jobCollection.doc(jobId).set({
            id: jobId,
            mznFileId: mznFileId,
            dznFileId: dznFileId,
            flags: flags,
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

    return {
        addJob,
        getAllJobs
    }
}
