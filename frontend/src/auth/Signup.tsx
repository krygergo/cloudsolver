import React, { FormEvent, useRef } from 'react'
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Link, useHistory, Redirect } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Signup() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const { user, signup } = useAuth()!;
    const history = useHistory();

    if(user)
        return <Redirect to="/" />

    const signupSubmit = async (formEvent: FormEvent) => {
        formEvent.preventDefault();
        if(!usernameRef.current?.value || !passwordRef.current?.value) return;
        try {
            await signup(usernameRef.current.value, passwordRef.current.value);
            history.push("/");       
        } catch(error) {
            
        }
    }

    return (
        <div className="d-flex flex-column-reverse">
            <Row className="w-100 text-center mb-2">
                <Link to="/login" style={{
                    textDecoration: "none"
                }}>
                    <b className="fs-4">Log In</b>
                </Link>
            </Row>
            <Row className="flex-grow-1">
                <div className="h-100 d-flex align-items-center justify-content-center">
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
                </div>
            </Row>
        </div>
    );
}
