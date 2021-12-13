import { ArtifactRegistryClient} from "@google-cloud/artifact-registry";

const registry = new ArtifactRegistryClient();

export default () => registry;