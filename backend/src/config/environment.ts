import { Environment } from "../env";

export enum ExitCodes {
    MISSING_EXPRESS_PROGRAM_STAGE,
    MISSING_EXPRESS_COOKIE_SECRET
}

export const env = process.env as Environment;

