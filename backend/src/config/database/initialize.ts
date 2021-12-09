import { addUser } from "../../user/userService"
import { env } from "../environment";

export default async () => {
    if(env.NODE_ENV === "dev")
        addUser("sadmin", "12345", "ADMIN");
}