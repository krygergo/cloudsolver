import bcrypt from "bcrypt";
import collection, { isAdmin, UserRight } from "./userModel";
import { v4 as uuid } from "uuid";
import { JobService } from "./job/jobService";
import k8s from "../config/kubernetes"

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
        createdAt: Date.now(),
        vCPUMax: 100,
        memoryMax: 200
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

export const deleteUserById = async (userId: string) => {
    if (!await getUserById(userId))
        return undefined;

    // Delete the users active Jobs
    const pendingJobs = await JobService(userId).getAllQueuedAndRunningJobs();
    const allJobs = await k8s().batchApi.listNamespacedJob("default");

    pendingJobs.forEach(pj => {
        allJobs.body.items.forEach(j => {
            if (j.metadata?.name?.startsWith(pj.id))
                k8s().batchApi.deleteNamespacedJob(j.metadata.name, "default", undefined, undefined, undefined, undefined, "Background");
        });
    })

    // Delete all material related to user
    collection().doc(userId).delete();
}

export const verifyUserAdminRight = async (userId: string) => { 
    const user = await getUserById(userId);
    if (!user)
        return undefined;
    return isAdmin(user.userRight);
}

export const updateUserResourcesById = async (userId: string, vCPUMax?: number, memoryMax?: number) => {
    const updateObject = (vCPUMax?: number, memoryMax?: number) => vCPUMax && memoryMax
        ? {vCPUMax: vCPUMax, memoryMax: memoryMax} : vCPUMax
        ? {vCPUMax: vCPUMax} : {memoryMax: memoryMax!}
    try{
        await collection().doc(userId).update(updateObject(vCPUMax, memoryMax));
        return true;
    }
    catch(error){
        console.log(error);
        return false;
    }
}