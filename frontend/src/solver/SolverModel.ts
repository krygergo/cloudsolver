export interface Solver {
    images: string[]
}

export interface SolverJob {
    mznFileId: string
    dznFileId: string
    solvers: string[]
    vCPUMax?: number
    memoryMax?: number
    config?: string
}