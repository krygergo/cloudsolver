import { V1Job } from "@kubernetes/client-node";
import k8s from "../config/kubernetes";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { JobService } from "../user/job/jobService";
import { FileService } from "../user/file/fileService";
import { getUserById } from "../user/userService";
import { User } from "../user/userModel";

const solverPodJob = (userId: string, jobId: string, solver: string, memoryMax: number, vCPUMax: number): V1Job => ({
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
                    }
                    ,
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

export const SolverService = (userId: string) => {
    const jobService = JobService(userId);
    const fileService = FileService(userId);
    const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

    const startSolverJob = async (mznFileId: string, dznFileId: string, solvers: string[], 
        memoryMax?: number, vCPUMax?: number, config?: {[key: string]: any}) => {
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
            if(vCPUUsage > user?.memoryMax!)
                return {code: 2, message: "CPU spceficied exceeds users maximum"};
            if(memoryUsage > await jobService.getAvailableMemory() || vCPUUsage > await jobService.getAvailablevCPU()) {
                jobService.addJob(mznFileId, dznFileId, memoryUsage, vCPUUsage, solvers, config, "QUEUED");
            } else {
                const jobId = await jobService.addJob(mznFileId, dznFileId, memoryUsage, vCPUUsage, solvers, config);
                solvers.forEach(solver => k8s().batchApi.createNamespacedJob("default", solverPodJob(userId, jobId, solver, memoryUsage, vCPUUsage)));
            }
            return {code: 0, message: "Successfully started job"};
        } catch(error) {
            return {code: 1, message: "Error starting job"};
        }
    }

    return {
        startSolverJob
    }
}