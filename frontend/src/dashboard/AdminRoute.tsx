import React from 'react'
import { Route, RouteProps } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { isAdministrator } from '../user/UserUtils';

export default function AdminRoute({...rest}: RouteProps) {
    const { user } = useAuth()!;
    return (
        isAdministrator(user?.userRight!) ? <Route {...rest} /> : <></> 
    );
}
