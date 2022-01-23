export interface User {
    username: string
    userRight: UserRights
    createdAt: number
}


export type UserRights = "DEFAULT" | "ADMIN"
