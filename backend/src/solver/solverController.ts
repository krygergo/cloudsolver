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

    const jobService = JobService(req.session.userId!);    
    const currentmemoryMax = req.body.memoryMax ? req.body.memoryMax : jobService.getAvailableMemory()
    const currentvCPUMax = req.body.vCPUMax ? req.body.vCPUMax : jobService.getAvailablevCPU()

    if (currentmemoryMax > JobService(req.session.userId!).getAvailableMemory())
        return res.status(400).send("Memory capacity exceeded"); 
    if (currentvCPUMax > JobService(req.session.userId!).getAvailablevCPU())
        return res.status(400).send("vCPU capacity exceeded");
    if(!(await SolverService(req.session.userId!).startSolverJob(body.mznFileId, body.dznFileId, body.solvers, currentmemoryMax, currentvCPUMax, body.config)))
        return res.status(400).send("Error in request body");
    res.sendStatus(200);
});

route.get("/job", async (req, res) => {
    res.send(await JobService(req.session.userId!).getAllJobs());
})

route.get("/job/listen", (req, res) => JobService(req.session.userId!).listenOnChange(req, res));

export default route;