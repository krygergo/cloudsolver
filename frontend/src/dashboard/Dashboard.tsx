import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Row, Col, ListGroup, Form, Button } from 'react-bootstrap';
import { fileType, UserFile } from '../user/file/FileModel';
import { getFileBinary, getFileByNameListen, getFiles, postFile } from '../user/file/fileService';
import SelectedFileProvider, { SelectType, SetFile, useSelectedFile } from './SelectedFileContext';

export default function Dashboard() {
    return (
        <div className="d-flex text-white">
            <SelectedFileProvider>
                <Col className="col-2" >
                    <Files/>
                </Col>
                <Col className="col-4">
                    <FileIO/>
                </Col>
                <Col>
                </Col>
            </SelectedFileProvider>
        </div>
    );
}

function Files() {
    const [files, setFiles] = useState<UserFile[]>([]);
    const selectedFile = useSelectedFile()!;

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
                    <Row style={{ height: "4vh" }} className="d-flex justify-content-center align-items-end">
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

    async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
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

    function submitFile(file: File) {
        const formData = new FormData();
        formData.append("minizinc", file);
        return postFile(formData);
    }

    function MZNFiles({files}: {files: UserFile[]}) {
        const {mzn, setMzn} = selectedFile;
        return <ListFiles files={files} select={{ file: mzn, setFile: setMzn }}/>
    }

    function DZNFiles({files}: {files: UserFile[]}) {
        const {dzn, setDzn} = selectedFile;
        return <ListFiles files={files} select={{ file: dzn, setFile: setDzn}}/>;
    }

    function ListFiles({files, select}: {files: UserFile[], select: SelectType}) {
        return (
            <div style={{ width: "100%", height: "90%", overflowY: "scroll", paddingRight: "27px", boxSizing: "content-box" }}>
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

        function onFileSelect(file: UserFile) {
            return (_: any) => {
                if(select.file?.name === file.name)
                    return select.setFile(undefined);
                select.setFile(file);
            }
        }
    }    
}

function FileIO() {
    const [mznText, setMznText] = useState<string>("");
    const [dznText, setDznText] = useState<string>("");
    const selectedFile = useSelectedFile()!;

    useEffect(() => {
        (async () => {
            if(selectedFile.mzn) {
                const mzn = selectedFile.mzn;
                const fileBinary = await getFileBinary(mzn.fileBinaryId);
                const fileBinaryText = Buffer.from(fileBinary.binary.data).toString();
                setMznText(fileBinaryText);
            } else {
                setMznText("");
            }
            if(selectedFile.dzn) {
                const dzn = selectedFile.dzn;
                const fileBinary = await getFileBinary(dzn.fileBinaryId);
                const fileBinaryText = Buffer.from(fileBinary.binary.data).toString();
                setDznText(fileBinaryText);
            } else {
                setDznText("");
            }
        })();
    }, [selectedFile]);

    return (
        <div>
            <Row style={{ height: "44vh" }}>
                <Form>
                    <Form.Group style={{ height: "100%" }}>
                        <Form.Control value={mznText} onChange={(event: any) => setMznText(event.target.value)} 
                            className="bg-transparent h-100 text-white" as="textarea" style={{ resize: "none", border: "none" }} />
                    </Form.Group>
                </Form>
            </Row>
            <Row style={{ height: "44vh" }}>
                <Form>
                    <Form.Group style={{ height: "100%" }}>
                        <Form.Control value={dznText} onChange={(event: any) => setDznText(event.target.value)} 
                            className="bg-transparent h-100 text-white" as="textarea" style={{ resize: "none", border: "none" }} />
                    </Form.Group>
                </Form>
            </Row>
        </div>
    ); 
}