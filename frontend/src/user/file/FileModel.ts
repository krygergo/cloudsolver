export interface UserFile {
    id: string
    name: string
    fileBinaryId: string
    createdAt: number
    updatedAt: number
}

export interface FileBinary {
    id: string
    binary: {
        data: Buffer
    }
}

export type FileType = "mzn" | "dzn";

export const fileType = (fileName: string): FileType => fileName.slice(fileName.length - 3) === "mzn" ? "mzn" : "dzn"