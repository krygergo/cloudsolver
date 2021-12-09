import React, { FormEvent, useRef } from 'react'
import { Button, Form, Row } from 'react-bootstrap';
import { Link, Redirect, useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const { user, login } = useAuth()!;
    const history = useHistory();

    if(user)
        return <Redirect to="/" />

    const loginSubmit = async (formEvent: FormEvent) => {
        formEvent.preventDefault();
        if(!usernameRef.current?.value || !passwordRef.current?.value) return;
        try {
            await login(usernameRef.current.value, passwordRef.current.value);
            history.push("/");       
        } catch(error) {

        }
    }

    return (
        <div className="d-flex flex-column-reverse">
            <Row className="w-100 text-center mb-2">
                <Link to="/signup" style={{
                    textDecoration: "none"
                }}>
                    <b className="fs-4">Sign Up</b>
                </Link>
            </Row>
            <Row className="flex-grow-1">
                <div className="h-100 d-flex align-items-center justify-content-center">
                    <Form onSubmit={loginSubmit}>
                        <Form.Group id="username">
                            <Form.Control type="text" placeholder="username" ref={usernameRef} required />
                        </Form.Group>
                        <Form.Group className="mt-3" id="password">
                            <Form.Control type="password" placeholder="password" ref={passwordRef} required />
                        </Form.Group>
                        <Button className="w-100 mt-3" type="submit">
                            Log In
                        </Button>
                    </Form>
                </div>
            </Row>
        </div>
    );
}
