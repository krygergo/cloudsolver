import { addUser } from "../../user/userService"
import { env } from "../environment";

export default async () => {
    if(env.NODE_ENV !== "production")
        addUser("sadmin", "12345", "ADMIN");
}