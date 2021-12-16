import { writeFile } from "fs";
import { Firestore, FirestoreDataConverter, QueryDocumentSnapshot } from "@google-cloud/firestore";

const fileBinaryConverter: FirestoreDataConverter<FileBinary> = {
    toFirestore(fileBinary: FileBinary) {
        return fileBinary;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as FileBinary;
    }
}

interface FileBinary {
    id: string
    binary: Buffer
}

const fileConverter: FirestoreDataConverter<File> = {
    toFirestore(file: File) {
        return file;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as File;
    }
}

interface File {
    id: string
    fileBinaryId: string
}

const jobConverter: FirestoreDataConverter<Job> = {
    toFirestore(job: Job) {
        return job;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
        return snapshot.data() as Job;
    }
}

interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    config: {[key: string]: any}
}

const firestore = new Firestore();

const main = async () => {
    const args = process.argv.slice(2);

    const userId = args[0];
    const jobId = args[1];

    const userDocument = firestore.collection("User").doc(userId);

    const jobSnapshot = await userDocument.collection("Job").doc(jobId).withConverter(jobConverter).get();
    if(!jobSnapshot.exists)
        return undefined; //todo
    
    const job = jobSnapshot.data()!;

    const mznFileSnapshot = await userDocument.collection("File").doc(job.mznFileId).withConverter(fileConverter).get();
    if(!mznFileSnapshot.exists)
        return undefined; //todo

    const mznFile = mznFileSnapshot.data()!;

    const mznFileBinarySnapshot = await userDocument.collection("FileBinary").doc(mznFile.fileBinaryId).withConverter(fileBinaryConverter).get();
    if(!mznFileBinarySnapshot.exists)
        return undefined; //todo
    
    const mznFileBinary = mznFileBinarySnapshot.data()!;

    const dznFileSnapshot = await userDocument.collection("File").doc(job.dznFileId).withConverter(fileConverter).get();
    if(!dznFileSnapshot.exists)
        return undefined; //todo
    
    const dznFile = dznFileSnapshot.data()!;

    const dznFileBinarySnapshot = await userDocument.collection("FileBinary").doc(dznFile.fileBinaryId).withConverter(fileBinaryConverter).get();
    if(!dznFileBinarySnapshot.exists)
        return undefined; //todo
    
    const dznFileBinary = dznFileBinarySnapshot.data()!;

    writeFile("/shared/mznFile.mzn", mznFileBinary.binary, (error) => {
        if(error)
            throw error;
    });

    writeFile("/shared/dznFile.dzn", dznFileBinary.binary, (error) => {
        if(error)
            throw error;
    });

    const config = JSON.stringify({
        ...job.config,
        "output-time": true,
        "output-to-file": "/shared/result.txt"
    });

    writeFile("/shared/config.mpc", config, (error) => {
        if(error)
            throw error;
    });

}

main();