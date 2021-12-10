import { UploadedFile } from "express-fileupload";
import storage from "../../../config/googleStorage"
import stream from "stream"
import k8s from "../../../config/kubernetes"
import { V1Pod } from "@kubernetes/client-node";

const bucket = storage().bucket("cloudsolver-334113.appspot.com");


const kanikoPod = (solvername: string): V1Pod => ({
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
        name: "kaniko"
    },
    spec: {
        containers: [{ 
            name: "kaniko",
            image: "gcr.io/kaniko-project/executor:edge",
            args: [
                "--dockerfile=./Dockerfile",
                `--context=gs://cloudsolver-334113.appspot.com/solvers/${solvername}.tar.gz`,
                `--destination=gcr.io/cloudsolver-334113/${solvername}:latest`
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
        }]
    },
})


/* This will return true if the file was uploaded and false otherwise. */ 
export const addSolverFile = async (fileUpload: UploadedFile) => {
    const file = bucket.file("solvers/" + fileUpload.name);
    const fileExists = (await file.exists())[0];
    if (fileExists)
        return false;

    const passthroughStream = new stream.PassThrough();
    passthroughStream.write(fileUpload.data);
    passthroughStream.end();

    async function streamFileUpload() {
        passthroughStream.pipe(file.createWriteStream()).on('finish', () => {})}
    streamFileUpload().catch(console.error);
    const solvername = fileUpload.name.slice(0, fileUpload.name.length-".tar.gz".length);
    k8s().api.createNamespacedPod("default", kanikoPod(solvername));
    return true; 
}