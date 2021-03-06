import { FileCollection, getFileType } from "./fileModel";
import { UploadedFile } from "express-fileupload";
import { FileBinaryService } from "./binary/fileBinaryService";
import googleFirestore from "../../config/database/googleFirestore";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";

const firestore = googleFirestore();

/**
 * Returns a list of functions related to the user files.
 */
export const FileService = (userId: string) => {
    const fileBinaryService = FileBinaryService(userId);
    const fileCollection = FileCollection(userId);

    const addFile = async (uploadedFile: UploadedFile) => {
        const fileSnapshot = await fileCollection.where("name", "==", uploadedFile.name.slice(0, uploadedFile.name.length - 4)).get();
        if(!fileSnapshot.empty)
            return undefined;
        const batch = firestore.batch();
        const fileBinaryDoc = fileBinaryService.createFileBinaryDoc(uuid());
        batch.set(fileBinaryDoc, {
            id: fileBinaryDoc.id,
            binary: uploadedFile.data.toString()
        });
        const fileDoc = fileCollection.doc(uuid());
        const timeStamp = Date.now();
        batch.set(fileDoc, {
            id: fileDoc.id,
            fileBinaryId: fileBinaryDoc.id,
            name: uploadedFile.name.slice(0, uploadedFile.name.length - 4),
            type: getFileType(uploadedFile.name)!,
            size: uploadedFile.size,
            createdAt: timeStamp,
            updatedAt: timeStamp,
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

        const updateFileData = async (binary: string) => {
            const batch = firestore.batch();
            const file = await getFile();
            if(!file)
                return undefined;
            batch.update(fileBinaryService.getFileBinaryDoc(file.fileBinaryId), {
                binary: binary
            });
            batch.update(document, {
                size: binary.toString().length,
                updatedAt: Date.now() 
            });
            return batch.commit();
        }

        const updateFileName = async (name: string) => {
            const allFiles = await getAllFiles();
            const filtered = allFiles.filter(f => f.name === name);
            if (filtered.length > 0)
                return undefined;
            return document.update({ name: name });
        }

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

    const fileByName = (fileName: string) => {
        const name = fileName.slice(0, fileName.length -  4);
        const type = fileName.slice(fileName.length - 3);
        const query = fileCollection.where("name", "==", name).where("type", "==", type);
        
        const getFile = async () => {
            const fileSnapshot = await query.get();
            if(fileSnapshot.empty)
                return undefined;
            return fileSnapshot.docs[0].data()!;
        }

        const listenOnChange = (req: Request, res: Response) => {
            const unsub = query.onSnapshot(snapshot => {
                if(!snapshot.empty) {
                    res.send(snapshot.docs[0].data());
                    unsub();
                }
            },() => res.status(500).send("Error listening on file"));
            req.once("close", () => {
                unsub();
                res.end();
            });
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
