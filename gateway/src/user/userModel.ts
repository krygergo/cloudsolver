import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../config/googleFirestore";

type UserRight = "ADMIN" | "DEFAULT"

export interface User {
    id: string
    username: string
    hashedPassword: string
    userRight: UserRight
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
