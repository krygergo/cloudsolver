import { FileType, getFileType } from "./fileModel";
import collection from "./fileModel";
import { UploadedFile } from "express-fileupload";
import { createFileBinary, updateOrDeleteFileBinary } from "./binary/fileBinaryService";
import googleFirestore from "../../config/database/googleFirestore";
import { Response } from "express";

const firestore = googleFirestore();

const createFile = (userId: string) => collection(userId).doc();

export const addFile = async (userId: string, fileUpload: UploadedFile) => {
    const fileSnapshot = await collection(userId).where("name", "==", fileUpload.name).get();
    if(!fileSnapshot.empty)
        return undefined;
    const batch = firestore.batch();
    const fileBinary = createFileBinary(userId);
    batch.set(fileBinary, {
        id: fileBinary.id,
        binary: fileUpload.data
    });
    const file = createFile(userId);
    const timeStamp = Date.now();
    batch.set(file, {
        id: file.id,
        fileBinaryId: fileBinary.id,
        createdAt: timeStamp,
        updatedAt: timeStamp,
        ...(({data, mv, ...rest}) => rest)(fileUpload)
    });
    return batch.commit();
}

const updateOrDeleteFile = (userId: string, fileId: string) => collection(userId).doc(fileId);

export const updateFileData = async (userId: string, fileId: string, fileUpload: UploadedFile) => {
    const fileSnapshot = await collection(userId).doc(fileId).get();
    if(!fileSnapshot.exists)
        return undefined;
    const file = fileSnapshot.data()!;
    const batch = firestore.batch();
    batch.update(updateOrDeleteFileBinary(userId, file.fileBinaryId), { binary: fileUpload.data} );
    batch.update(updateOrDeleteFile(userId, fileId), {
        ...file,
        size: fileUpload.size,
        encoding: fileUpload.encoding,
        checksum: fileUpload.md5,
        updatedAt: Date.now()
    });
    return batch.commit();
}

export const updateFileName = async (userId: string, fileId: string, name: string) => collection(userId).doc(fileId).update({ name: name });

export const deleteFile = async (userId: string, fileId: string) => {
    const fileSnapshot = await collection(userId).doc(fileId).get();
    if(!fileSnapshot.exists)
        return undefined;
    const file = fileSnapshot.data()!;
    const batch = firestore.batch();
    batch.delete(updateOrDeleteFileBinary(userId, file.fileBinaryId));
    batch.delete(updateOrDeleteFile(userId, fileId));
    return batch.commit();
}

export const getAllFiles = async (userId: string) => (await collection(userId).get()).docs.map((snapshot) => snapshot.data());

export const getFileByName = async (userId: string, name: string) => {
    const fileSnapshot = await collection(userId).where("name", "==", name).get();
    if(!fileSnapshot.empty)
        return undefined;
    return fileSnapshot.docs[0].data();
}

export const getFileByType = async (userId: string, type: FileType) => {
    const fileSnapshot = await collection(userId).where("type", "==", type).get();
    if(!fileSnapshot.empty)
        return undefined;
    return fileSnapshot.docs.map((snapshot) => snapshot.data());
}

export const sendFileByNameListen = async (userId: string, name: string, res: Response) => {
    const unsub = collection(userId).where("name", "==", name).onSnapshot((snapshot) => {
        if(!snapshot.empty) {
            res.send(snapshot.docs[0].data());
            unsub();
        }
    },(error) => res.status(500).send("Error listening on file"));
}
