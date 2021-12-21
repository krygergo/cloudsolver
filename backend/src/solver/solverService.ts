import { V1Job } from "@kubernetes/client-node";
import k8s from "../config/kubernetes";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { createJob, JobService } from "../user/job/jobService";
import { FileService } from "../user/file/fileService";
import { getUserById } from "../user/userService";
import firestore from "../config/database/googleFirestore";
import { Job } from "../user/job/jobModel";

export const solverPodJob = (userId: string, jobId: string, solver: string, memoryMax: number, vCPUMax: number): V1Job => ({
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
                }],
                containers: [{
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
                }, {
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
        backoffLimit: 0,
        activeDeadlineSeconds: 60 * 15, // Must finish within 15min
        ttlSecondsAfterFinished: 0
    }
});

/**
 * This function returns a single function, that is used to start solvers inthe name of the user.
 */
export const SolverService = (userId: string) => {
    const jobService = JobService(userId);
    const fileService = FileService(userId);
    const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

    const startSolverJob = async (mznFileId: string, dznFileId: string, solvers: string[], 
        memoryMax?: number, vCPUMax?: number, config?: string) => {
        const images = await artifactRegistryService.getAllImages();
        if(!solvers.every(solver => images.includes(solver)))
            return {code: 6, message: "One of the solvers specified is not supported"};
        if(!await fileService.fileById(mznFileId).get())
            return {code: 5, message: "mznFile doesn't exist"};
        if(!await fileService.fileById(dznFileId).get())
            return {code: 4, message: "dznFile doesn't exist"};
        try {
            const user = await getUserById(userId);
            const memoryUsage = memoryMax ? memoryMax : user?.memoryMax!;
            if(memoryUsage > user?.memoryMax!)
                return {code: 3, message: "Memory specified exceeds users maximum"};
            const vCPUUsage = vCPUMax ? vCPUMax : user?.vCPUMax!;
            if(vCPUUsage > user?.vCPUMax!)
                return {code: 2, message: "CPU spceficied exceeds users maximum"};

            const jobId = await firestore().runTransaction(async transacation => {
                const jobTransactions = jobService.withTransactions(transacation);
                const jobs = await jobTransactions.queuedAndRunningJobsQuery();
                const createAndReturnJobId = () => {
                    const job = createJob(mznFileId, dznFileId, memoryUsage, vCPUUsage, solvers, config);
                    jobTransactions.addJob(job);
                    return job.id;
                }
                if(jobs.length === 0)
                    return createAndReturnJobId();
                const availableMemory = user?.memoryMax! - jobs.reduce((total: number, nextJob: Job) => total + nextJob.memoryMax, 0);
                const availablevCPU = user?.vCPUMax! - jobs.reduce((total: number, nextJob: Job) => total + nextJob.vCPUMax, 0);
                if(memoryUsage > availableMemory || vCPUUsage > availablevCPU) {
                    const job = createJob(mznFileId, dznFileId, memoryUsage, vCPUUsage, solvers, config, "QUEUED");
                    jobTransactions.addJob(job);
                    return undefined;
                }
                return createAndReturnJobId();
            });
            if(jobId) 
                solvers.forEach(solver => k8s().batchApi.createNamespacedJob("default", solverPodJob(userId, jobId, solver, memoryUsage / solvers.length, vCPUUsage / solvers.length)));
            return {code: 0, message: "Successfully started job"};
        } catch(error) {
            return {code: 1, message: "Error starting job"};
        }
    }

    return {
        startSolverJob
    }
}