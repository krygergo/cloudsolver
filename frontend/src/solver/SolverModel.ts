export interface Solver {
    images: string[]
}

export interface SolverJob {
    mznFileId: string
    dznFileId: string
    solvers: string[]
    vCPU?: number
    memory?: number
    flags?: string
}