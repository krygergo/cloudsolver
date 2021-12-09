import { Router } from "express";
import { auth } from "../auth/auth";

import { deleteUserById, getUserById } from "./userService";

const route = Router();

route.get("/", async (req, res) => {
    const user = (await getUserById(req.session.userId!))!;
    const userResponse = (({id, hashedPassword, ...rest}) => rest)(user);
    res.send(userResponse);
});

route.delete("/:userId", auth, async (req, res) => {
    const userId = req.session.userId!;
    await deleteUserById(userId);
    res.sendStatus(200);
});

export default route;