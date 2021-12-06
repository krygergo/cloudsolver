import { ClusterManagerClient } from "@google-cloud/container";

const client = new ClusterManagerClient();

export default () => client;