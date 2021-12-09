import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Col, ListGroup, Form } from 'react-bootstrap';
import { fileType, UserFile } from '../user/file/FileModel';
import {  getFileByNameListen, getFiles, postFile } from '../user/file/fileService';
import SelectedFileProvider, { SelectType, useSelectedFile } from './SelectedFileContext';

export default function Dashboard() {
    return (
        <div className="d-flex text-white">
            <SelectedFileProvider>
                <Col className="col-2" >
                    <Files/>
                </Col>
                <Col className="col-4">
                    <FileIO />
                </Col>
                <Col>
                </Col>
            </SelectedFileProvider>
        </div>
    );
}

function Files() {

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
                    <Row style={{ height: "42vh", width: "100%", overflow: "hidden"}} >
                        <MZNFiles files={files.filter((file) => fileType(file.name) === "mzn")} />
                    </Row>
                    <hr style={{ border: "solid 2px white", visibility: "hidden" }}></hr>
                    <Row style={{ height: "42vh", width: "100%", overflow: "hidden"}} >
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

function ListFiles({files, select}: {files: UserFile[], select: SelectType}) {

    const onFileSelect = (file: UserFile) => (event: React.MouseEvent<HTMLButtonElement>) => {
        select.setFile(file);
    }

    return (
        <div style={{ width: "100%", height: "100%", overflowY: "scroll", paddingRight: "27px", boxSizing: "content-box" }}>
            <ListGroup >
                {files.map((file, index) => {
                    return (
                        <ListGroup.Item key={index} action 
                            className={`${file.name === select.file?.name ? "bg-primary" : "bg-transparent"} mb-1 text-white`} onClick={onFileSelect(file)}>
                            {file.name}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </div>
    );
}

function MZNFiles({files}: {files: UserFile[]}) {
    const selectedFile = useSelectedFile();
    if(!selectedFile)
        return <></>;
    const {mzn, setMzn} = selectedFile;
    return (
        <ListFiles files={files} select={{ file: mzn, setFile: setMzn }}/>
    );
}

function DZNFiles({files}: {files: UserFile[]}) {
    const selectedFile = useSelectedFile();
    if(!selectedFile)
        return <></>;
    const {dzn, setDzn} = selectedFile;
    return (
        <ListFiles files={files} select={{ file: dzn, setFile: setDzn}}/>
    );
}

function FileIO() {
    return (
        <div>
            <Row style={{ height: "80vh" }}>
                <Form>
                    <Form.Group className="h-100" controlId="formFileMultiple">
                        <Form.Control style={{ resize: "none"}} className="bg-transparent text-white h-100" as="textarea">{
                            
                        }</Form.Control> 
                    </Form.Group>
                </Form>
            </Row>
            <Row>
                TESTE
            </Row>
        </div>
    )
}
