import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore({
    projectId: "cloudsolver-334113"
});

export default () => firestore;
