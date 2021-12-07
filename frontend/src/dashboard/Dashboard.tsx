import React, { ChangeEvent, useState } from 'react'
import { FormEvent } from 'react';
import { Container, Row, Col, ListGroup, Form, Button } from 'react-bootstrap';

export default function Dashboard() {
    return (
        <Container className="d-flex text-white">
            <Row className="w-75">
                <Files />
            </Row>
            <Row className="flex-grow-1">
                <div>DASHBOARD</div>
            </Row>
        </Container>
    );
}

function Files() {

    const [selectedFile, setSelectedFile] = useState<File | null>();

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => setSelectedFile(event.target.files?.item(0));

    return (
        <Container className="d-flex">
            <Row className="w-25 flex-column">
                <Col>
                    <MZNFiles/>
                </Col>
                <Col>
                    <DZNFiles/>
                </Col>
                <Form>
                    <Form.Group controlId="formFileMultiple">
                        <Form.Label style={{ cursor: "pointer"}}><b>Add MZN or DZN file</b></Form.Label>
                        <Form.Control onChange={onFileChange} type="file" style={{ display: "none" }} />
                    </Form.Group>
                    {selectedFile ? <Button className="mb-3">{"Upload file"}</Button> : <></>}
                </Form>
            </Row>
            <Row>
                FILES
            </Row>
        </Container>
    );
}

function MZNFiles() {
    return (
        <div>MZN</div>
    );
}

function DZNFiles() {
    return (
        <div>DZN</div>
    );
}