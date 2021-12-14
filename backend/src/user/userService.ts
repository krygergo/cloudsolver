import bcrypt from "bcrypt";
import collection, { isAdmin, UserRight } from "./userModel";
import { v4 as uuid } from "uuid";

export async function addUser(username: string, password: string, userRight: UserRight = "DEFAULT") {
    const userSnapshot = await collection().where("username", "==", username).get();
    if(!userSnapshot.empty)
        return undefined;
    const userId = uuid();
    collection().doc(userId).set({
        id: userId,
        username: username,
        hashedPassword: await bcrypt.hash(password, 10),
        userRight: userRight,
        createdAt: Date.now()
    });
    return userId;
}

export const getUserById = async (id: string) => (await collection().doc(id).get()).data();

export const getUserByUsername = async (username: string) => {
    const userSnapshot = await collection().where("username", "==", username).get();
    if(userSnapshot.empty)
        return undefined;
    return userSnapshot.docs[0].data();
}

export const verifyUserPassword = (password: string, hashedPassword: string) => bcrypt.compare(password, hashedPassword);

export const deleteUserById = (userId: string) => collection().doc(userId).delete();

export const verifyUserAdminRight = async (userId: string) => { 
    const user = await getUserById(userId);
    if (!user)
        return undefined;
    return isAdmin(user.userRight);
}