import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../config/database/googleFirestore";

export type UserRight = "ADMIN" | "DEFAULT"

export interface User {
    id: string
    username: string
    hashedPassword: string
    userRight: UserRight
    createdAt: number
    vCPUMax: string
    memoryMax: string
}

const userConverter: FirestoreDataConverter<User> = {
    toFirestore(user: User) {
        return user;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as User;
    }
}

export const isAdmin = (userRight: UserRight) => userRight === "ADMIN";

export default () => firestore().collection("User").withConverter(userConverter);
