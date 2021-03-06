import { FirestoreStore } from "@google-cloud/connect-firestore";
import { CookieOptions, NextFunction, Request, Response, Router } from "express";
import expressSession, { MemoryStore } from "express-session";

import { login } from "../auth/auth";
import { signup } from "../auth/signup";
import fileRoute from "../user/file/fileController";
import { getUserSessionById } from "../session/sessionService";
import userRoute from "../user/userController";
import clusterRoute from "../cluster/clusterController";
import adminRoute from "../admin/adminController";
import solverRoute from "../solver/solverController";
import { env } from "./environment";
import firestore from "./database/googleFirestore";

const session = expressSession({
    name: "cloudsolver.sid",
    store: env.NODE_ENV === "test" ? new MemoryStore() : new FirestoreStore({
        dataset: firestore(),
        kind: "Session"
    }),
    secret: env.NODE_ENV === "prod" ? env.EXPRESS_COOKIE_SECRET : "secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: env.NODE_ENV === "prod",
        sameSite: env.NODE_ENV === "prod" ? "none" : "lax",
        ...(env.NODE_ENV === "prod" ? {domain: env.EXPRESS_ALLOW_ORIGIN.slice("https://".length)} : {})
    }
});

const userInfo = (req: Request, res: Response, next: NextFunction) => 
    "username" in req.body && "password" in req.body ? next() : res.status(400).send("Wrong information");

const userSession = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.session.userId)
        return res.status(401).send("Unauthorized request");
    const userSession = await getUserSessionById(req.sessionID);
    if(!userSession)
        return res.status(403).send("Session does not exist");
    if(userSession.userId !== req.session.userId)
        return res.status(403).send("Error in cookie");
    next();
}

const authCookie: CookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: false,
    ...(env.NODE_ENV === "prod" ? {domain: env.EXPRESS_ALLOW_ORIGIN.slice("https://".length)} : {})
}

const route = Router();

/**
 * These two routes are for unauthorized users.
 */
route.use(session);
route.post("/signup", userInfo, signup(authCookie));
route.post("/login", userInfo, login(authCookie));

/**
 * All other routes are only accessible when the user has a session ID.
 */
route.use(userSession); // Checks for valid cookie
route.use("/user", userRoute);
route.use("/file", fileRoute);
route.use("/cluster", clusterRoute);
route.use("/admin", adminRoute)
route.use("/solver", solverRoute)

export { route };