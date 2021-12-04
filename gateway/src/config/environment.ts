import { Environment } from "../env";

export enum ExitCodes {
    MISSING_GATEWAY_PROGRAM_STAGE,
    MISSING_GATEWAY_COOKIE_SECRET
}

export const env = process.env as Environment;
