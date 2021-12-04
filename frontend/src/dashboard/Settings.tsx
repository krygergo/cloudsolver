import React, { FormEvent, ReactNode, useRef, useState } from 'react'
import { Button, Card, Container, Form, Row, Spinner } from 'react-bootstrap';

export default function Settings() {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center">
            <Row>
                <SettingsBox>
                    <UpdateUsername/>
                </SettingsBox>
            </Row>
            <Row className="mt-1">
                <SettingsBox>
                    <UpdatePassword/>
                </SettingsBox>
            </Row>
        </Container>
    );
}

function SettingsBox({children}: {children: ReactNode}) {
    return (
        <Card style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    );
}

function UpdateUsername() {
    const updateUsernameRef = useRef<HTMLInputElement>(null);
    const [showButton, setShowButton] = useState(false);
    const [disable, setDisable] = useState(false);

    async function onInput() {
        if(!updateUsernameRef.current?.value)
            setShowButton(false);
        else
            setShowButton(true);
    }

    async function updateUsernameSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        setDisable(true);
        setTimeout(() => {
            setDisable(false);
            setShowButton(false);
            if(updateUsernameRef.current?.value)
                updateUsernameRef.current.value = "";
        }, 1000);
    }

    return (
        <Form onSubmit={updateUsernameSubmit}>
            <Container className="p-0">
                <Form.Group id="updateUsername">
                    <Form.Control onChange={onInput} type="text" placeholder="update username"
                     ref={updateUsernameRef} disabled={disable} required/>
                </Form.Group>
                {showButton ? <Button className="mt-3 w-100" type="submit" disabled={disable}>
                    {disable ? <Spinner role="status" size="sm" animation="border"/> : <>Apply</> }
                </Button> : <></>}
            </Container>
        </Form>
    );
}

function UpdatePassword() {
    const updatePasswordRef = useRef<HTMLInputElement>(null);
    const updatePasswordConfirmRef = useRef<HTMLInputElement>(null);
    const [showInput, setShowInput] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [disable, setDisable] = useState(false);

    async function onInputPassword() {
        if(!updatePasswordRef.current?.value) {
            setShowInput(false);
            setShowButton(false);
        } else {
            setShowInput(true);
        }
    }

    async function onInputPasswordConfirm() {
        if(!updatePasswordConfirmRef.current?.value)
            setShowButton(false);
        else
            setShowButton(true);
    }

    async function updatePasswordSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        setDisable(true);
        setTimeout(() => {
            setDisable(false);
            setShowButton(false);
            setShowInput(false);
            if(updatePasswordRef.current?.value)
                    updatePasswordRef.current.value = "";
        }, 1000);
    }

    return (
        <Form onSubmit={updatePasswordSubmit}>
            <Container className="p-0">
                <Form.Group id="updatePassword">
                    <Form.Control onChange={onInputPassword} type="password" placeholder="update password"
                     ref={updatePasswordRef} disabled={disable} required/>
                </Form.Group>
                {showInput ? <Form.Group className="mt-3" id="updatePasswordConfirm">
                    <Form.Control onChange={onInputPasswordConfirm} type="password" placeholder="confirm password"
                     ref={updatePasswordConfirmRef} disabled={disable} required/>
                </Form.Group> : <></>}
                {showButton ? <Button className="mt-3 w-100" type="submit" disabled={disable}>
                    {disable ? <Spinner role="status" size="sm" animation="border"/> : <>Apply</> }
                </Button> : <></>}
            </Container>
        </Form>
    );
}