import winston from "winston";
import { env } from "./environment";

const level = () => {
    if(env.NODE_ENV === "test")
        return "error";
    else if(env.NODE_ENV === "prod")
        return "warn";
    else 
        return "info";
}

export const defaultConfig: winston.LoggerOptions = {
    level: level(),
    transports: [ new winston.transports.Console() ]
}