import { Router } from "express";
import { getUserById } from "./userService";

const route = Router();

/**
 * Endpoint for getting own user information.
 */
route.get("/", async (req, res) => {
    const user = (await getUserById(req.session.userId!))!;
    const userResponse = (({id, hashedPassword, ...rest}) => rest)(user);
    res.send(userResponse);
});

export default route;