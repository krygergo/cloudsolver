import { Router } from "express";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { SolverService } from "./solverService";
import { JobService } from "../user/job/jobService";

const route = Router();

const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

route.get("/", async (_, res) => {
    const images = await artifactRegistryService.getAllImages();
    if(!images)
        return res.status(400).send("No solvers supported");
    res.send(({ images: images }));
})

route.post("/", (req, res) => {
    const body = req.body;
    SolverService(req.session.userId!).startSolverJob(
        body.mznFileId, body.dznFileId, body.solver, body.flags
    );
    res.sendStatus(200);
});

route.get("/jobs", async (req, res) => {
    res.send(await JobService(req.session.userId!).getAllJobs());
})

export default route;