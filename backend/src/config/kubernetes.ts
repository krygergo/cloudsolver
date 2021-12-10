import { KubeConfig, CoreV1Api } from "@kubernetes/client-node";

const config = new KubeConfig();
config.loadFromDefault();

const api = config.makeApiClient(CoreV1Api);

export default () => ({ config, api });
