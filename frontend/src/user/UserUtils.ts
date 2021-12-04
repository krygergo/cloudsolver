import { UserRights } from "./UserModels";

export function isAdministrator(userRight: UserRights) {
    return userRight === UserRights.ADMIN
}