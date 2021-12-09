import bcrypt from "bcrypt";
import collection, { isAdmin, UserRight } from "./userModel";

const createUser = () => collection().doc();

export async function addUser(username: string, password: string, userRight: UserRight = "DEFAULT") {
    const userSnapshot = await collection().where("username", "==", username).get();
    if(!userSnapshot.empty)
        return undefined;
    const user = createUser();
    collection().doc(user.id).set({
        id: user.id,
        username: username,
        hashedPassword: await bcrypt.hash(password, 10),
        userRight: userRight,
        createdAt: Date.now()
    });
    return user.id;
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