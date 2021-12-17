import { Router } from "express";
import { deleteUserJob, getUserById } from "./userService";

const route = Router();

route.get("/", async (req, res) => {
    const user = (await getUserById(req.session.userId!))!;
    const userResponse = (({id, hashedPassword, ...rest}) => rest)(user);
    res.send(userResponse);
});

route.delete("/job/:jobId", (req, res) => {
    deleteUserJob(req.session.userId!, req.params.jobId);
    res.send(200);
});

export default route;