import { KubeConfig, CoreV1Api, BatchV1Api } from "@kubernetes/client-node";

const config = new KubeConfig();
config.loadFromDefault();

const coreApi = config.makeApiClient(CoreV1Api);
const batchApi = config.makeApiClient(BatchV1Api)

export default () => ({ config, coreApi, batchApi });
