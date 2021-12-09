import cors from "cors";
import express from "express";
import { createLogger } from "winston";

import { env } from "./config/environment";
import { defaultConfig } from "./config/logger";
import { route as apiRoute } from "./config/routing";
import initializeDatabase from "./config/database/initialize";

const logger = createLogger(defaultConfig);

const app = express();

export const corsConfig: cors.CorsOptions = {
    origin: env.NODE_ENV === "test" ? "test" : env.EXPRESS_ALLOW_ORIGIN,
    credentials: true
}
app.set("trust proxy", 1);
app.use(cors(corsConfig));
logger.info(`Allows requests from origin ${env.EXPRESS_ALLOW_ORIGIN}`);

initializeDatabase();

app.use(express.json());
app.get("/", (_, res) => res.send("Ok"));
app.use("/", apiRoute);

export default app;
