import { FileCollection } from "./fileModel";
import { UploadedFile } from "express-fileupload";
import { FileBinaryService } from "./binary/fileBinaryService";
import googleFirestore from "../../config/database/googleFirestore";
import { Response } from "express";
import { v4 as uuid } from "uuid";

const firestore = googleFirestore();

export const FileService = (userId: string) => {
    const fileBinaryService = FileBinaryService(userId);
    const fileCollection = FileCollection(userId);

    const addFile = async (uploadedFile: UploadedFile) => {
        const fileSnapshot = await fileCollection.where("name", "==", uploadedFile.name).get();
        if(!fileSnapshot.empty)
            return undefined;
        const batch = firestore.batch();
        const fileBinaryDoc = fileBinaryService.createFileBinaryDoc(uuid());
        batch.set(fileBinaryDoc, {
            id: fileBinaryDoc.id,
            binary: uploadedFile.data
        });
        const fileDoc = fileCollection.doc(uuid());
        const timeStamp = Date.now();
        batch.set(fileDoc, {
            id: fileDoc.id,
            fileBinaryId: fileBinaryDoc.id,
            createdAt: timeStamp,
            updatedAt: timeStamp,
            ...(({data, mv, ...rest}) => rest)(uploadedFile)
        });
        return batch.commit();
    }

    const fileById = (fileId: string) => {
        const document = fileCollection.doc(fileId);

        const getFile = async () => {
            const fileSnapshot = await document.get();
            if(!fileSnapshot.exists)
                return undefined;
            return fileSnapshot.data()!;
        }

        const updateFileData = async (uploadedFile: UploadedFile) => {
            const batch = firestore.batch();
            const file = await getFile();
            if(!file)
                return undefined;
            batch.update(fileBinaryService.getFileBinaryDoc(file.fileBinaryId), {
                binary: uploadedFile.data
            });
            batch.update(document, {
                ...file,
                size: uploadedFile.size,
                encoding: uploadedFile,
                checksum: uploadedFile.md5,
                updatedAt: Date.now() 
            });
            return batch.commit();
        }

        const updateFileName = async (name: string) => document.update({ name: name });

        const deleteFile = async () => {
            const file = await getFile();
            if(!file)
                return undefined;
            const batch = firestore.batch();
            batch.delete(fileBinaryService.getFileBinaryDoc(file.fileBinaryId));
            batch.delete(document);
            return batch.commit();
        }

        return {
            get: getFile,
            updateFileData,
            updateFileName,
            deleteFile
        }
    }

    const fileByName = (name: string) => {
        const query = fileCollection.where("name", "==", name);
        
        const getFile = async () => {
            const fileSnapshot = await query.get();
            if(fileSnapshot.empty)
                return undefined;
            return fileSnapshot.docs[0].data()!;
        }

        const listenOnChange = (res: Response) => {
            const unsub = query.onSnapshot(snapshot => {
                if(!snapshot.empty) {
                    res.send(snapshot.docs[0].data());
                    unsub();
                }
            },error => res.status(500).send("Error listening on file"));
        }

        return {
            get: getFile,
            listenOnChange
        }
    }

    const getAllFiles = async () => {
        const fileSnapshot = await fileCollection.get();
        return fileSnapshot.docs.map(doc => doc.data());
    }

    return {
        addFile,
        fileById,
        fileByName,
        getAllFiles
    }
}
