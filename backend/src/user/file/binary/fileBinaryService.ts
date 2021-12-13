import { FileBinaryCollection } from "./fileBinaryModel";

export const FileBinaryService = (userId: string) => {
    const fileBinaryCollection = FileBinaryCollection(userId);

    const createFileBinaryDoc = () => fileBinaryCollection.doc();
    
    const getFileBinaryDoc = (fileBinaryId: string) => fileBinaryCollection.doc(fileBinaryId);
    
    const getFileBinaryById = async (fileBinaryId: string) => {
        const fileBinary = await getFileBinaryDoc(fileBinaryId).get();
        if(!fileBinary.exists)
            return undefined;
        return fileBinary.data();
    }
    return {
        createFileBinaryDoc,
        getFileBinaryDoc,
        getFileBinaryById
    }
}