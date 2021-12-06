import { NextFunction, Request, Response } from "express";
import { getUserByUsername, getUserById, verifyUserPassword } from "../user/userService";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    if(!("password" in req.body) || typeof req.body.password !== "string")
        return res.status(403).send("Must authenticate with password");
    const password = req.body.password as string;
    const user = await getUserById(req.session.userId!);
    if(!user)
        return res.status(403).send("User doesn't exist");
    if(!await verifyUserPassword(password, user.hashedPassword))
        return res.status(403).send("Wrong credentials");
    next();
}

export const login = async (req: Request, res: Response) => {
    const credentials = req.body as { username: string, password: string };
    const user = await getUserByUsername(credentials.username);
    if(!user)
        return res.status(403).send("User doesn't exist");
    if(!await verifyUserPassword(credentials.password, user.hashedPassword))
        return res.status(403).send("Wrong credentials");
    req.session.userId = user.id!;
    res.status(200).send("Successfully log in");
}