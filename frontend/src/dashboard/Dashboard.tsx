import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Col, ListGroup, Form } from 'react-bootstrap';
import { fileType, UserFile } from '../user/file/FileModel';
import {  getFileByNameListen, getFiles, postFile } from '../user/file/fileService';

export default function Dashboard() {
    return (
        <div className="d-flex text-white">
            <Col className="col-2" >
                <Files/>
            </Col>
            <Col>
            </Col>
        </div>
    );
}

function Files() {

    const [selectedMZN, setSelectedMZN] = useState<UserFile>();
    const [selectedDZN, setSelectedDZN] = useState<UserFile>();

    const [files, setFiles] = useState<UserFile[]>([]);

    const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);
        if(!file)
            return
        try {
            const listener = getFileByNameListen(file.name);
            await submitFile(file);
            const newFile = await listener;
            setFiles(files => [...files, newFile]);
        } catch(error) {

        }
    }

    const submitFile = async (file: File) => {
        const formData = new FormData();
        formData.append("minizinc", file);
        return postFile(formData);
    }

    useEffect(() => {
        (async () => {
            const userFiles = await getFiles();
            setFiles(userFiles);
        })();
    }, []);

    return (
        <div className="d-flex flex-column">
            <Row className="vh-100">
                <Col>
                    <Row style={{ height: "44vh", width: "100%", overflow: "hidden"}} >
                        <MZNFiles files={files.filter((file) => fileType(file.name) === "mzn")} />
                    </Row>
                    <Row style={{ height: "44vh", width: "100%", overflow: "hidden"}} >
                        <DZNFiles files={files.filter((file) => fileType(file.name) === "dzn")} />
                    </Row>
                    <Row className="d-flex justify-content-center align-items-end">
                        <Form>
                            <Form.Group controlId="formFileMultiple">
                                <Form.Label style={{ cursor: "pointer"}}><b>Add MZN or DZN file</b></Form.Label>
                                <Form.Control onChange={onFileChange} type="file" style={{ display: "none" }} />
                            </Form.Group>
                        </Form>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}

function MZNFiles({files}: {files: UserFile[]}) {
    return (
        <div style={{ width: "100%", height: "100%", overflowY: "scroll", paddingRight: "27px", boxSizing: "content-box" }}>
        <ListGroup >
            {files.map((file, index) => {
                return (
                    <ListGroup.Item key={index} action className="bg-transparent mb-1 text-white">
                        {file.name}
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
        </div>
    );
}

function DZNFiles({files}: {files: UserFile[]}) {
    return (
        <div style={{ width: "100%", height: "100%", overflowY: "scroll", paddingRight: "27px", boxSizing: "content-box" }}>
        <ListGroup>
            {files.map((file, index) => {
                return (
                    <ListGroup.Item key={index} action className="bg-transparent mb-1 text-white">
                        {file.name}
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
        </div>
    );
}