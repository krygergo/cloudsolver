import { V1Job } from "@kubernetes/client-node";
import k8s from "../config/kubernetes";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { JobService } from "../user/job/jobService";

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
                    resources:{
                        limits:{
                            memory:`${memoryMax}`+`Mi`,
                            cpu: `${vCPUMax}`+`m`
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
    const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

    const startSolverJob = async (mznFileId: string, dznFileId: string, solvers: string[], memoryMax: number, vCPUMax: number, config?: {[key: string]: any}) => {
        const images = await artifactRegistryService.getAllImages();
        if(!solvers.every(solver => images.includes(solver)))
            return undefined;
        try {
            if(memoryMax > await jobService.getAvailableMemory() && vCPUMax > await jobService.getAvailablevCPU()) {
                jobService.addJob(mznFileId, dznFileId, memoryMax, vCPUMax, config, solvers, "QUEUED");
            } else {
                const jobId = await jobService.addJob(mznFileId, dznFileId, memoryMax, vCPUMax, config, solvers);
                solvers.forEach(solver => k8s().batchApi.createNamespacedJob("default", solverPodJob(userId, jobId, solver, memoryMax, vCPUMax)));
            }
            return true;
        } catch(error) {
            console.log(error);
        }
    }

    return {
        startSolverJob
    }
}