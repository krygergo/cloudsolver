import { addUser } from "../../user/userService"

/**
 * An admin user is automatically created upon database initialization in the development environment.
 */
export default async () => {
        addUser("sadmin", "12345", "ADMIN");
}