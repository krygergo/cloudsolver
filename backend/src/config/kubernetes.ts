import { KubeConfig } from "@kubernetes/client-node";

const config = new KubeConfig();

config.loadFromCluster();

export default () => config;
