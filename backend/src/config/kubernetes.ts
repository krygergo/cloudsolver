import { KubeConfig, CoreV1Api, BatchV1Api } from "@kubernetes/client-node";

const config = new KubeConfig();
config.loadFromDefault();

const api = config.makeApiClient(CoreV1Api);
const api2 = config.makeApiClient(BatchV1Api)

export default () => ({ config, api, api2 });
