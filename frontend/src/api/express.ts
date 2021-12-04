import axios, { AxiosRequestConfig } from "axios"
import { env } from "../config/environment"

const config: AxiosRequestConfig = {
    baseURL: env.REACT_APP_EXPRESS_URL,
    withCredentials: true
}

export const get = <T> (endpoint: string) => axios.get<T>(endpoint, config);

export const post = <T> (endpoint: string, data: T) => axios.post(endpoint, data, config); 
