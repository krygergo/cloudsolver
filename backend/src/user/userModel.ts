import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../config/googleFirestore";

export const DEFAULT_VCPU = 3;

type UserRight = "ADMIN" | "DEFAULT"

export interface User {
    id: string
    username: string
    hashedPassword: string
    userRight: UserRight
    vCPU: number
    createdAt: number
}

const userConverter: FirestoreDataConverter<User> = {
    toFirestore(user: User) {
        return user;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as User;
    }
}

export default () => firestore().collection("User").withConverter(userConverter);
