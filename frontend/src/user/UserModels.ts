export interface User {
    username: string
    userRight: UserRights
    createdAt: number
}

export enum UserRights {
    ADMIN,
    DEFAULT
}