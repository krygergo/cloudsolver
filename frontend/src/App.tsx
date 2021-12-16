import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import NavigationBar from './navigationbar/NavigationBar';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { Container, Row } from 'react-bootstrap';
import AuthUserRoute from './auth/AuthUserRoute';
import UserRoute from './user/UserRoute';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Container fluid className="vh-100 d-flex flex-column" style={{
        backgroundImage: "linear-gradient(rgba(4,9,30,0.75),rgba(4,9,30,0.75)),url(/cloud_background.jpg)",
        overflow: "hidden"
      }}>
          <Row>
            <NavigationBar/>
          </Row>
          <Row className="vh-100">
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <AuthUserRoute path="/" component={UserRoute} />
            </Switch>
          </Row>
      </Container>
    </BrowserRouter>
  );
}

export default App;
