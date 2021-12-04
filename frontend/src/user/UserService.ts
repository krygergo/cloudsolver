import { get, post } from "../api/gateway";
import { User } from "./UserModels";

export const signupUser = (username: string, password: string) => post("/signup", {
    username: username,
    password: password
});

export const loginUser = (username: string, password: string) => post("/login", {
    username: username,
    password: password
});

export const getUser = () => get<User>("/user");