import { Request, Response } from "express";
import { addUser } from "../user/userService";

export const signup = async (req: Request, res: Response) => {
    const credentials = req.body as { username: string, password: string };
    const userId = await addUser(credentials.username, credentials.password);
    if(!userId)
        return res.status(403).send("User allready exists");
    req.session.userId = userId;
    res.status(201).send("Successfully sign up");
}