import { post, get } from "../../api/express";
import { UserFile } from "./FileModel";


export const postFile = (formData: FormData) => post("/file", formData);

export const getFiles = async () => (await get<UserFile[]>("/file")).data;

export const getFileByName = async (name: string) => (await get<UserFile>(`/file/${name}/name`)).data;

export const getFileByNameListen = async (name: string) => (await get<UserFile>(`/file/${name}/name/listen`)).data;