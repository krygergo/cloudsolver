import { AxiosError } from 'axios';
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { env } from '../config/environment';
import { User } from '../user/UserModel';
import { getUser, loginUser, signupUser } from '../user/UserService';

type Auth = {
    user: User | undefined
    login: (username: string, password: string) => Promise<void>
    signup: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
} | undefined;

const AuthContext = createContext<Auth>(undefined);

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [cookies, , removeCookies] = useCookies(["cloudsolver.auth"]);

    const login = async (username: string, password: string) => {
        try {
            await loginUser(username, password);
            setUser((await getUser()).data);
        } catch(error) {
            const err = error as AxiosError;
            switch (err.response?.status) {
                default:
                    break;
            }
        }
    }

    const signup = async (username: string, password: string) => {
        try {
            await signupUser(username, password);
            setUser((await getUser()).data);
        } catch(error) {
            const err = error as AxiosError;
            switch (err.response?.status) {
                default:
                    break;
            }
        }
    }

    const logout = async () => {
        removeCookies("cloudsolver.auth", { path: "/", domain: env.REACT_APP_DOMAIN });
        setUser(undefined);
      }
    

    useEffect(() => {
        (async () => {
            if(cookies["cloudsolver.auth"]) {
                try {
                    const user = (await getUser()).data;
                    setUser(user);
                } catch(error) {
                    removeCookies("cloudsolver.auth", { path: "/", domain: env.REACT_APP_DOMAIN });
                }
            }
            setLoading(false);
        })();
    }, [cookies, removeCookies]);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}