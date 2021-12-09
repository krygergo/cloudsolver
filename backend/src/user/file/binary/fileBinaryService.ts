import fileBinaryCollection from "./fileBinaryModel";

export default (userId: string) => {
    const fileBinaryCol = fileBinaryCollection(userId);

    const createFileBinaryDoc = () => fileBinaryCol.doc();
    
    const getFileBinaryDoc = (fileBinaryId: string) => fileBinaryCol.doc(fileBinaryId);
    
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
