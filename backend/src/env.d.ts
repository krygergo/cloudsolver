import fileUpload from "express-fileupload";
import { File } from "./user/file/fileModel";

export interface Environment {
    NODE_ENV: string
    EXPRESS_COOKIE_SECRET: string
    EXPRESS_ALLOW_ORIGIN: string
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment {}
    }
}

declare module "express-session" {
    interface SessionData {
        userId: string | undefined
    }
}

declare module "express" {
    interface Response {
        locals: {
            file?: fileUpload.UploadedFile | undefined
        }
    }
}