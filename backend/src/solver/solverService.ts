import { V1Job } from "@kubernetes/client-node";
import k8s from "../config/kubernetes";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { JobService } from "../user/job/jobService";

const solverPodJob = (userId: string, jobId: string, solver: string): V1Job => ({
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
        name: `${solver}-${userId}`
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
                    command: [
                        "minizinc"
                    ],
                    args: [
                        "/shared/mznFile.mzn",
                        "/shared/dznFile.dzn",
                        "--output-time",
                        "--output-to-file",
                        "/shared/result.txt"
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

    const startSolverJob = async (mznFileId: string, dznFileId: string, solvers: string[], flags?: string) => {
        if(!solvers.every(async solver => (await artifactRegistryService.getAllImages()).includes(solver)))
            return undefined;
        try {
            const jobId = await jobService.addJob(mznFileId, dznFileId, flags ? flags : "");
            solvers.forEach(solver => k8s().batchApi.createNamespacedJob("default", solverPodJob(userId, jobId, solver)));
        } catch(error) {
            console.log(error);
        }
    }

    return {
        startSolverJob
    }
}