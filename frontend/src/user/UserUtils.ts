import { UserRights } from "./UserModel";

export const isAdministrator = (userRight: UserRights) => userRight === UserRights.ADMIN