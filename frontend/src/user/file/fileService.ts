import { post, get, del, put } from "../../api/express";
import { FileBinary, UserFile } from "./FileModel";

export const postFile = (formData: FormData) => post("/file", formData);

export const getFiles = async () => (await get<UserFile[]>("/file")).data;

export const getFileByName = async (name: string) => (await get<UserFile>(`/file/name/${name}`)).data;

export const getFileByNameListen = async (name: string) => (await get<UserFile>(`/file/name/listen/${name}`)).data;

export const getFileBinary = async (fileBinaryId: string) => (await get<FileBinary>(`/file/binary/${fileBinaryId}`)).data;

export const putFileBinary = (fileId: string, binaryDataBuffer: string) => put(`/file/binary/${fileId}`, {binary: binaryDataBuffer});

export const putFileName = (fileId: string, newName: string) => put(`/file/name/${fileId}?name=${newName}`);

export const deleteFile = async (fileId: string) => (await del(`/file/${fileId}`)).data;