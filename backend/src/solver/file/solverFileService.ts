import { UploadedFile } from "express-fileupload";
import storage from "../../config/googleStorage"
import { PassThrough } from "stream"
import k8s from "../../config/kubernetes"
import { V1Job } from "@kubernetes/client-node";
import { env } from "../../config/environment";

const bucket_root = `${env.EXPRESS_GCP_PROJECT_NAME}.appspot.com`
const bucket = storage().bucket(bucket_root);

const kanikoJob = (solvername: string): V1Job => ({
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
        name: `kaniko-job-${solvername}`
    },
    spec: {
        template: {
            spec: {
                containers: [{ 
                    name: `kaniko-container-${solvername}`,
                    image: "gcr.io/kaniko-project/executor:edge",
                    args: [
                        "--dockerfile=./Dockerfile",
                        `--context=gs://${bucket_root}/solvers/${solvername}.tar.gz`,
                        `--destination=eu.gcr.io/${env.EXPRESS_GCP_PROJECT_NAME}/${solvername}:latest`
                    ],
                    volumeMounts: [{
                        name: "keys",
                        mountPath: "/keys",
                        readOnly: true
                    }],
                    env: [{
                        name: "GOOGLE_APPLICATION_CREDENTIALS",
                        value: "/keys/google-api-key.json"
                    }],
                }],
                restartPolicy: "Never",
                volumes: [{
                    name: "keys",
                    secret: {
                        secretName: "google-api-key"
                    }
                }],
            }
        },
        activeDeadlineSeconds: 60 * 30, // Must finish within 30min
        ttlSecondsAfterFinished: 0
    }
})

/* This will return true if the file was uploaded and false otherwise. */ 
export const addSolverFile = async (fileUpload: UploadedFile) => {
    const file = bucket.file("solvers/" + fileUpload.name);
    const fileExists = (await file.exists())[0];
    if (fileExists)
        return false;

    const passthroughStream = new PassThrough();
    passthroughStream.write(fileUpload.data);
    passthroughStream.end();

    async function streamFileUpload() {
        passthroughStream.pipe(file.createWriteStream()).on('finish', () => {})
    };
    
    streamFileUpload().catch(console.error);
    const solvername = fileUpload.name.slice(0, fileUpload.name.length-".tar.gz".length);
    k8s().batchApi.createNamespacedJob("default", kanikoJob(solvername));
    return true; 
}
