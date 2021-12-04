import { SessionData } from "express-session";
import collection from "./sessionModel";

export const getUserSessionById = async (id: string) => {
    const data = (await collection().doc(id).get()).data()?.data;
    if(!data)
        return undefined;
    return JSON.parse(data) as SessionData;
}