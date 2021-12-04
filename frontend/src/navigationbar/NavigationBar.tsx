import React from 'react'
import { Col, Container, Navbar, Image } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isAdministrator } from '../user/UserUtils';
import { User } from '../user/UserModels';
import { useCookies } from 'react-cookie';

export default function NavigationBar() {
  const auth = useAuth();
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
        auth?.user ? <Col><NavigationBarUser/></Col> : <></>
      }
    </Navbar>
  );
}

function NavigationBarUser() {
  const {user, setUser} = useAuth() as {user: User, setUser: React.Dispatch<React.SetStateAction<User | undefined>>};
  const history = useHistory();
  const removeCookie = useCookies(['cloudsolver.sid'])[2];
  
  async function logout() {
    removeCookie("cloudsolver.sid");
    setUser(undefined);
    history.push("/");
  }

  return (
    <Container className="p-0 d-flex flex-column align-items-end">
      <Container className="p-0 d-flex justify-content-end">
        { isAdministrator(user.userRight) ? 
          <Link to="/administrator">
            <Image src="/administrator_icon.png"/>
          </Link> : <></> 
        }
        <Link to="/settings">
          <Image className="ms-1" src="/settings_icon.png"/>
        </Link>
        <Link to="/" onClick={logout}>
          <Image className="ms-1" src="/logout_icon.png"/>
        </Link>
      </Container>
      <b className="text-muted">{user.username}</b>
    </Container>
  );
}