import { UserRights } from "./UserModel";

export const isAdmin = (userRight: UserRights) => userRight === "ADMIN";