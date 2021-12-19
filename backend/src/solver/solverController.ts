import { Router } from "express";
import { ArtifactRegistryService } from "../google/artifactRegistryService";
import { SolverService } from "./solverService";
import { JobService } from "../user/job/jobService";

const route = Router();

const artifactRegistryService = ArtifactRegistryService("europe", "eu.gcr.io");

route.get("/", async (_, res) => {
    const images = await artifactRegistryService.getAllImages();
    if(images.length === 0)
        return res.status(400).send("No solvers supported");
    res.send(({ images: images }));
})

route.post("/", async (req, res) => {
    const body = req.body;
    if(!body.mznFileId)
        return res.status(400).send("No mznField");
    if(!body.dznFileId)
        return res.status(400).send("No dznField");
    if(!body.solvers)
        return res.status(400).send("No solvers");
    if(!Array.isArray(body.solvers))
        return res.status(400).send("Solvers field must be of type array");
    const solverJob = (await SolverService(req.session.userId!).startSolverJob(
        body.mznFileId, body.dznFileId, body.solvers, body.memoryMax, body.vCPUMax, body.config
    ));
    if(solverJob.code !== 0)
        return res.status(400).send(solverJob.message);
    res.status(200).send(solverJob.message);
});

route.get("/job", async (req, res) => {
    res.send(await JobService(req.session.userId!).getAllJobs());
})

route.get("/job/listen", (req, res) => {
    req.setTimeout(1000 * 60 * 60);
    JobService(req.session.userId!).listenOnChange(req, res)
});

export default route;