import React from 'react'
import { Col, Container, Navbar, Image } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isAdministrator } from '../user/UserUtils';

export default function NavigationBar() {
  const { user } = useAuth()!;
  return (
    <Navbar>
      <Col>
        <Navbar.Brand>
          <Link to="/" style={{
            textDecoration: "none"
          }}>
            <b className="fs-2 text-muted">Cloud Solver</b>
          </Link>
        </Navbar.Brand>
      </Col>
      {
        user ? <Col><NavigationBarUser/></Col> : <></>
      }
    </Navbar>
  );
}

function NavigationBarUser() {
  const { user, logout } = useAuth()!;
  const history = useHistory();
  
  const logoutLink = async () => {
    try {
      await logout();
    } catch(error) {

    }
    history.push("/");
  }

  return (
    <Container className="p-0 d-flex flex-column align-items-end">
      <Container className="p-0 d-flex justify-content-end">
        { isAdministrator(user?.userRight!) ? 
          <Link to="/administrator">
            <Image src="/administrator_icon.png"/>
          </Link> : <></> 
        }
        <Link to="/settings">
          <Image className="ms-1" src="/settings_icon.png"/>
        </Link>
        <Link to="/" onClick={logoutLink}>
          <Image className="ms-1" src="/logout_icon.png"/>
        </Link>
      </Container>
      <b className="text-muted">{user?.username!}</b>
    </Container>
  );
}