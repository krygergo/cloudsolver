import googleRegistry from "../config/googleArtifactRegistry"

export const ArtifactRegistryService = (location: string, repository: string) => {
    const registry = googleRegistry();
    const repositoryPath = registry.repositoryPath("cloudsolver-334113", location, repository);

    const getAllImages = async () => {
        const [images] = await registry.listPackages({
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