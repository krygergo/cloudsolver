import { SessionData } from "express-session";
import { SessionCollection } from "./sessionModel";

export const getUserSessionById = async (id: string) => {
    const data = (await SessionCollection().doc(id).get()).data()?.data;
    if(!data)
        return undefined;
    return JSON.parse(data) as SessionData;
}