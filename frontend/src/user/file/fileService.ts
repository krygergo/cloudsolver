import { post, get, del } from "../../api/express";
import { FileBinary, UserFile } from "./FileModel";


export const postFile = (formData: FormData) => post("/file", formData);

export const getFiles = async () => (await get<UserFile[]>("/file")).data;

export const getFileByName = async (name: string) => (await get<UserFile>(`/file/name/${name}`)).data;

export const getFileByNameListen = async (name: string) => (await get<UserFile>(`/file/name/listen/${name}`)).data;

export const getFileBinary = async (fileBinaryId: string) => (await get<FileBinary>(`/file/binary/${fileBinaryId}`)).data;

export const deleteFile = async (fileId: string) => (await del(`/file/${fileId}`)).data;