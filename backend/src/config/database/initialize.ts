import { addUser } from "../../user/userService"

export default async () => {
        addUser("sadmin", "12345", "ADMIN");
}