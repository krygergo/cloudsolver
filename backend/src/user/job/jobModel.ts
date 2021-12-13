
export interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    result: Result
}

interface Result {
    status: Status
    output: string
}

type Status = "FAILED" | "RUNNING" | "SUCCESS"
