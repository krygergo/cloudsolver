import React from 'react';
import AuthProvider from './auth/AuthContext';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import NavigationBar from './navigationbar/NavigationBar';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { Container, Row } from 'react-bootstrap';
import AuthUserRoute from './auth/AuthUserRoute';
import UserRoute from './user/UserRoute';

function App() {
  return (
    <BrowserRouter>
      <Container fluid className="vh-100 d-flex flex-column" style={{
        backgroundImage: "linear-gradient(rgba(4,9,30,0.75),rgba(4,9,30,0.75)),url(/cloud_background.jpg)"
      }}>
        <AuthProvider>
          <Row>
            <NavigationBar/>
          </Row>
          <Row className="flex-grow-1">
            <Switch>
              <AuthUserRoute exact path="/" component={UserRoute} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
            </Switch>
          </Row>
        </AuthProvider>
      </Container>
    </BrowserRouter>
  );
}

export default App;
