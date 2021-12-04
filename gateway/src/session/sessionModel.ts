import { FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";
import firestore from "../config/googleFirestore";

export interface Session {
    id?: string
    data: string
}

const sessionConverter: FirestoreDataConverter<Session> = {
    toFirestore(userSession: Session) {
        return {
            data: userSession.data
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        const data = snapshot.data() as Session;
        return {
            id: snapshot.id,
            data: data.data
        }
    }
}

export default () => firestore().collection("Session").withConverter(sessionConverter);
