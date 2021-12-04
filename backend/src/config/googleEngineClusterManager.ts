import { ClusterManagerClient } from "@google-cloud/container";

const client = new ClusterManagerClient({
    projectId: "dm885-cloud-solver"
});

export default () => client;