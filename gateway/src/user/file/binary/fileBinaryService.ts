import collection from "./fileBinaryModel"

export const createFileBinary = (userId: string) => collection(userId).doc();

export const updateOrDeleteFileBinary = (userId: string, fileBinaryId: string) => collection(userId).doc(fileBinaryId);

export const getFileBinaryById = async (userId: string, id: string) => {
    const fileDataDocument = await collection(userId).doc(id).get();
    if(!fileDataDocument.exists)
        return undefined;
    return fileDataDocument.data();
}
