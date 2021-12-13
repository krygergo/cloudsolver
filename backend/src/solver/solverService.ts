import { V1Pod } from "@kubernetes/client-node";

const solverPod = (userId: string, jobId: string, solverImage: string): V1Pod => ({
    apiVersion: "v1",
    kind: "Job",
    metadata: {
        name: `Solver-${userId}-${jobId}`
    },
    spec: {
        restartPolicy: "Never",
        initContainers: [{
            name: `FileInput-${userId}-${jobId}`,
            image: "europe-north1-docker.pkg.dev/cloudsolver-334113/solver/input",
            args: [
                userId,
                jobId
            ],
            volumeMounts: [{
                name: `shared-data`,
                mountPath: "/shared",
            }]
        }, {
            name: `Minizinc-${userId}-${jobId}`,
            image: `eu.gcr.io/cloudsolver-334113/${solverImage}`,
            args: [
                "\"$(< /shared/flagFile.txt)\"",
                "--output-time",
                "/shared/mznFile.mzn",
                "/shared/dznFile.dzn",
                " > /shared/result.txt"
            ],
            volumeMounts: [{
                name: `shared-data`,
                mountPath: "/shared",
            }]
        }],
        containers: [{
            name: `FileOutput-${userId}-${jobId}`,
            image: "europe-north1-docker.pkg.dev/cloudsolver-334113/solver/output",
            args: [
                userId,
                jobId
            ],
            volumeMounts: [{
                name: `shared-data`,
                mountPath: "/shared",
            }]
        }],
        volumes: [{
            name: "shared-data"
        }]
    }
});

const startSolverJob = (userId: string, jobId: string, solverImage: string) => {
    
}
