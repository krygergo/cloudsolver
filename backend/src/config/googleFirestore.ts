import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore({
    projectId: "dm885-cloud-solver"
});

export default () => firestore;
