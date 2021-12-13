import { Router } from "express";
import { ArtifactRegistryService } from "../google/artifactRegistryService";

const route = Router();

const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

route.get("/", async (_, res) => {
    const images = await artifactRegistryService.getAllImages();
    if(!images)
        return res.status(400).send("No solvers supported");
    res.send(({ images: images }));
})

export default route;