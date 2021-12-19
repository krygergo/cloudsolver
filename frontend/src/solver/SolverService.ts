import { get, post } from "../api/express";
import { Solver, SolverJob } from "./SolverModel";

export const getSupportedSolvers = async () => (await get<Solver>("/solver")).data.images;

export const submitSolverJob = (solverJob: SolverJob) => post("/solver", solverJob);
