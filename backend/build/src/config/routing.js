"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const connect_firestore_1 = require("@google-cloud/connect-firestore");
const express_1 = require("express");
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = require("../auth/auth");
const signup_1 = require("../auth/signup");
const fileController_1 = require("../user/file/fileController");
const sessionService_1 = require("../session/sessionService");
const userController_1 = require("../user/userController");
const clusterController_1 = require("../cluster/clusterController");
const environment_1 = require("./environment");
const googleFirestore_1 = __importDefault(require("./googleFirestore"));
const session = (0, express_session_1.default)({
    name: "cloudsolver.sid",
    store: new connect_firestore_1.FirestoreStore({
        dataset: (0, googleFirestore_1.default)(),
        kind: "Session"
    }),
    secret: environment_1.env.NODE_ENV === "prod" ? environment_1.env.EXPRESS_COOKIE_SECRET : "secret",
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === "prod",
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: environment_1.env.NODE_ENV === "prod",
        secure: environment_1.env.NODE_ENV === "prod",
        sameSite: environment_1.env.NODE_ENV === "prod" ? "none" : "strict",
        domain: environment_1.env.NODE_ENV === "prod" ? environment_1.env.EXPRESS_ALLOW_ORIGIN.slice("https://".length) : environment_1.env.EXPRESS_ALLOW_ORIGIN.slice("http://".length)
    }
});
const userInfo = (req, res, next) => "username" in req.body && "password" in req.body ? next() : res.status(400).send("Wrong information");
const userSession = async (req, res, next) => {
    if (!req.session.userId)
        return res.status(401).send("Unauthorized request");
    const userSession = await (0, sessionService_1.getUserSessionById)(req.sessionID);
    if (!userSession)
        return res.status(403).send("Session do not exist");
    if (userSession.userId !== req.session.userId)
        return res.status(403).send("Error in cookie");
    next();
};
const route = (0, express_1.Router)();
exports.route = route;
route.use(session);
route.post("/signup", userInfo, signup_1.signup);
route.post("/login", userInfo, auth_1.login);
route.use(userSession);
route.use("/user", userController_1.route);
route.use("/file", fileController_1.route);
route.use("/cluster", clusterController_1.route);
//# sourceMappingURL=routing.js.map