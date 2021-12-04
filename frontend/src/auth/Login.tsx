import { AxiosError } from 'axios';
import React, { FormEvent, useRef } from 'react'
import { Button, Form, Container, Row } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { getUser, loginUser } from '../user/UserService';
import { useAuth } from './AuthContext';

export default function Login() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const setUser = useAuth()?.setUser;
    const history = useHistory();

    async function loginSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        if(!setUser) return;
        if(!usernameRef.current?.value || !passwordRef.current?.value) return;
        try {
            await loginUser(usernameRef.current?.value, passwordRef.current?.value);
            const user = (await getUser()).data;
            setUser(user);
            history.push("/");
        } catch(error) {
            const err = error as AxiosError;
            switch (err.response?.status) {
                default:
                    break;
            }
        }
    }

    return (
        <Container className="d-flex flex-column-reverse">
            <Row className="w-100 text-center mb-2">
                <Link to="/signup" style={{
                    textDecoration: "none"
                }}>
                    <b className="fs-4">Sign Up</b>
                </Link>
            </Row>
            <Row className="flex-grow-1">
                <Container className="h-100 d-flex align-items-center justify-content-center">
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
                </Container>
            </Row>
        </Container>
    );
}
