import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { useCookies } from 'react-cookie';
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
    const cookies = useCookies()[0];

    useEffect(() => {
        (async () => {
            if(cookies["cloudsolver.sid"] && !user)
                setUser((await getUser()).data);
            setLoading(false);
        })();
    }, [cookies, user]);

    return (
        <AuthContext.Provider value={{
            user,
            setUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}