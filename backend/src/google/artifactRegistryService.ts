import googleArtifactRegistry from "../config/googleArtifactRegistry"
import { env } from "../config/environment"

export const ArtifactRegistryService = (location: string, repository: string) => {
    const artifactRegistry = googleArtifactRegistry();
    const repositoryPath = artifactRegistry.repositoryPath(`${env.EXPRESS_GCP_PROJECT_NAME}`, location, repository);

    const getAllImages = async () => {
        const [images] = await artifactRegistry.listPackages({
            parent: repositoryPath
        });
        return images.map((image) => image.name?.slice(repositoryPath.length + "/packages/".length)!);
    }

    return {
        getAllImages
    }
}
