export interface UserFile {
    id: string
    name: string
    type: string
    size: number
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