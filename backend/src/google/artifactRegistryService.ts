import googleArtifactRegistry from "../config/googleArtifactRegistry"

export const ArtifactRegistryService = (location: string, repository: string) => {
    const artifactRegistry = googleArtifactRegistry();
    const repositoryPath = artifactRegistry.repositoryPath("cloudsolver-334113", location, repository);

    const getAllImages = async () => {
        const [images] = await artifactRegistry.listPackages({
            parent: repositoryPath
        });
        if(images.length == 0)
            return undefined;
        return images.map((image) => image.name?.slice(repositoryPath.length + "/packages/".length)!);
    }

    return {
        getAllImages
    }
}
