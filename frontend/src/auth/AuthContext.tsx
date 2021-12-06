import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { useCookies } from 'react-cookie';
import { env } from '../config/environment';
import { User } from '../user/UserModels';
import { getUser } from '../user/UserService';

type Auth = {
    user: User | undefined
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>
} | undefined;

const AuthContext = createContext<Auth>(undefined);

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(true);
    const [cookies, _, removeCookies] = useCookies(["cloudsolver.auth"]);

    useEffect(() => {
        (async () => {
            if(cookies["cloudsolver.auth"] && !user) {
                try {
                    const user = (await getUser()).data;
                    setUser(user);
                } catch(error) {
                    removeCookies("cloudsolver.auth", { path: "/", domain: env.REACT_APP_DOMAIN });
                }
            }
            setLoading(false);
        })();
    });

    return (
        <AuthContext.Provider value={{
            user,
            setUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}