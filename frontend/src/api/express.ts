import axios, { AxiosRequestConfig } from "axios"
import { env } from "../config/environment"

const config: AxiosRequestConfig = {
    baseURL: env.REACT_APP_EXPRESS_URL,
    withCredentials: true
}

export const get = <T> (endpoint: string) => axios.get<T>(endpoint, config);

export const post = (endpoint: string, data: any) => axios.post(endpoint, data, config); 

export const del = (endpoint: string) => axios.delete(endpoint, config);

export const put = (endpoint: string, data?: any) => axios.put(endpoint, data, config)
