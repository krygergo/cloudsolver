import React from 'react'
import { Route, RouteProps } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { isAdministrator } from '../user/UserUtils';
import { User } from '../user/UserModels';

export default function AdminRoute({...rest}: RouteProps) {
    const user = useAuth()?.user as User;
    return (
        isAdministrator(user.userRight) ? <Route {...rest} /> : <></> 
    );
}
