import React from 'react'
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AuthUserRoute({...rest}: RouteProps) {
    const user = useAuth()?.user;
    return (
        user ? <Route {...rest}/> : <Redirect to="/login"/>
    );
}
