import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Dashboard from '../dashboard/Dashboard'
import Administrator from '../dashboard/Administrator';
import AdminRoute from '../dashboard/AdminRoute';
import Settings from '../dashboard/Settings'

export default function UserRoute() {
    return (
        <>
            <Route exact path="/" component={Dashboard}/>
            <Route path="/settings" component={Settings}/>
            <AdminRoute path="/administrator" component={Administrator}/>
        </>
    );
}
