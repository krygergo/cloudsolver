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
    const cookie = useCookies()[0]['cloudsolver.sid']

    useEffect(() => {
        (async () => {
            if(cookie) {
                try {
                    const userResponse = await getUser();
                    setUser(userResponse.data);
                } catch(error) {
                    
                }
            }
            setLoading(false);
        })();
    }, [cookie])

    return (
        <AuthContext.Provider value={{
            user,
            setUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}