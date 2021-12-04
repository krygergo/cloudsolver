import { AxiosError } from 'axios';
import React, { FormEvent, useRef } from 'react'
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { getUser, signupUser } from '../user/UserService';
import { useAuth } from './AuthContext';


export default function Signup() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const setUser = useAuth()?.setUser;
    const history = useHistory();

    async function signupSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        if(!setUser) return;
        if(!usernameRef.current?.value || !passwordRef.current?.value) return;
        try {
            await signupUser(usernameRef.current?.value, passwordRef.current?.value);
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
                <Link to="/Login" style={{
                    textDecoration: "none"
                }}>
                    <b className="fs-4">Log In</b>
                </Link>
            </Row>
            <Row className="flex-grow-1">
                <Container className="h-100 d-flex align-items-center justify-content-center">
                    <Form onSubmit={signupSubmit}>
                        <Form.Group id="username">
                            <Form.Control type="text" placeholder="username" ref={usernameRef} required />
                        </Form.Group>
                        <Form.Group className="mt-3" id="password">
                            <Form.Control type="password" placeholder="password" ref={passwordRef} required />
                        </Form.Group>
                        <Form.Group className="mt-3" id="password-confirm">
                            <Form.Control type="password" placeholder="confirm password" required />
                        </Form.Group>
                        <Button className="w-100 mt-3" type="submit">
                            Sign Up
                        </Button>
                    </Form>
                </Container>
            </Row>
        </Container>
    );
}
