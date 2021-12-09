import { Options, UploadedFile } from "express-fileupload"

const MAX_FILE_SIZE_IN_BYTES = 1_000_000

export const defaultFileUploadConfig: Options = {
    limits: {
        fileSize: MAX_FILE_SIZE_IN_BYTES
    },
    abortOnLimit: true
}

export const asSingleFile = (upload: UploadedFile | UploadedFile[]) => 
    Array.isArray(upload) ? undefined : upload as UploadedFile;