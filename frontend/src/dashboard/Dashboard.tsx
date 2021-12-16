import React, { ChangeEvent, useEffect, useState } from 'react'
import { Row, Col, ListGroup, Form, Button } from 'react-bootstrap';
import { UserFile } from '../user/file/FileModel';
import { deleteFile, getFileBinary, getFileByNameListen, getFiles, postFile } from '../user/file/fileService';
import FileProvider, { FileSelect, SetUserFile, useFile } from './FileContext';

export interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    config: {[key: string]: any}
    result: Result
    createdAt: number
    finishedAt?: number
}

interface Result {
    status: Status
    solver?: string
    output?: string
}

type Status = "PENDING" | "FINISHED"

export default function Dashboard() {

    //const [jobState, setJobState] = useState<Job[]>([]);

    useEffect(() => {
        //const eventSource = new EventSource("https://api.cloudsolver.xyz/solver/job/listen", {withCredentials: true});
        //eventSource.addEventListener("message", message => setJobState(JSON.parse(message.data)));
    }, []);

    return (
        <div className="d-flex text-white">
            <FileProvider>
                <Col className="col-2" >
                    <Files/>
                </Col>
                <Col className="col-4">
                    <FileIO/>
                </Col>
                <Col>
                </Col>
            </FileProvider>
        </div>
    );
}

function Files() {
    const { selected, files, setFiles } = useFile()!;

    useEffect(() => {
        (async () => {
            const userFiles = await getFiles();
            setFiles(userFiles);
        })();
    }, [setFiles]);
    return (
        <div className="d-flex flex-column">
            <Row className="vh-100">
                <Col>
                    <Row style={{ height: "44vh", width: "100%", overflow: "hidden"}} >
                        <MZNFiles files={files.filter(file => file.type  === "mzn")} />
                    </Row>
                    <Row style={{ height: "44vh", width: "100%", overflow: "hidden"}} >
                        <DZNFiles files={files.filter(file => file.type === "dzn")} />
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
        const {mzn} = selected;
        return <ListFiles files={files} select={mzn}/>
    }

    function DZNFiles({files}: {files: UserFile[]}) {
        const {dzn} = selected;
        return <ListFiles files={files} select={dzn}/>;
    }

    function ListFiles({files, select}: {files: UserFile[], select: FileSelect}) {
        return (
            <div style={{ width: "100%", height: "90%", overflowY: "scroll", paddingRight: "27px", boxSizing: "content-box" }}>
                <ListGroup >
                    {files.map((file, index) => {
                        return (
                            <ListGroup.Item key={index} action 
                                className={`${file.name === select.get?.name ? "bg-primary" : "bg-transparent"} mb-1 text-white`} 
                                onClick={onFileSelect(file)}>
                                    <b className="d-flex align-items-center">
                                        {`${file.name}.${file.type}`}
                                    </b>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </div>
        );

        function onFileSelect(file: UserFile) {
            return (_: any) => {
                if(select.get?.name === file.name)
                    return select.set(undefined);
                select.set(file);
            }
        }
    }    
}

function FileIO() {
    const emptyText = {name: "", body: ""};
    const [mznText, setMznText] = useState<{name: string, body: string}>(emptyText);
    const [dznText, setDznText] = useState<{name: string, body: string}>(emptyText);
    const { selected, files, setFiles } = useFile()!;

    useEffect(() => {
        (async () => {
            if(selected.mzn.get) {
                const mzn = selected.mzn.get;
                const fileBinary = await getFileBinary(mzn.fileBinaryId);
                const fileBinaryText = Buffer.from(fileBinary.binary.data).toString();
                setMznText({name: mzn.name, body: fileBinaryText});
            } else {
                setMznText(emptyText);
            }
            if(selected.dzn.get) {
                const dzn = selected.dzn.get;
                const fileBinary = await getFileBinary(dzn.fileBinaryId);
                const fileBinaryText = Buffer.from(fileBinary.binary.data).toString();
                setDznText({name: dzn.name, body: fileBinaryText});
            } else {
                setDznText(emptyText);
            }
        })();
    }, [selected]);

    function updateMzn(event: React.MouseEvent<HTMLElement, MouseEvent>) {
        
    }

    function deleteMzn() {
        const mzn = selected.mzn;
        deleteFile(mzn.get?.id!);
        setFiles(files.filter(file => file.id !== mzn.get?.id!));
        mzn.set(undefined);
    }

    function updateDzn() {

    }

    function deleteDzn() {
        const dzn = selected.dzn;
        deleteFile(dzn.get?.id!);
        setFiles(files.filter(file => file.id !== dzn.get?.id!));
        dzn.set(undefined);
    }

    return (
        <div>
            <Row style={{ height: "44vh" }}>
                <Form>
                    <Form.Group style={{ height: "100%" }}>
                        {selected.mzn.get ? 
                            <div className="h-100 text-white" spellCheck="false">
                                <Form.Control value={mznText.name} onChange={event => setMznText({name: event.target.value, body: mznText.body})} 
                                    type="text" className="bg-transparent text-white" style={{ height: "10%", border: "none"}} />
                                <div style={{ height: "90%", position: "relative" }}>
                                    <Form.Control value={mznText.body} onChange={event => setMznText({name: mznText.name, body: event.target.value})} 
                                        className="bg-transparent h-100 text-white scrollbar scrollbar-primary" as="textarea" 
                                        style={{ resize: "none", border: "none", whiteSpace: "pre", cursor: "auto" }}/>
                                    <div className="d-flex flex-column" style={{ bottom: "3%", right: "2%", position: "absolute" }}>
                                        <Button className="mb-1" size="sm" variant="info" onClick={updateMzn}>
                                            UPDATE
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={deleteMzn}>
                                            DELETE
                                        </Button>
                                    </div>
                                </div>
                            </div> : <></>}
                    </Form.Group>
                </Form>
            </Row>
            <Row style={{ height: "44vh" }}>
                <Form>
                    <Form.Group style={{ height: "100%" }}>
                        {selected.dzn.get ? 
                            <div className="h-100 text-white" spellCheck="false">
                                <Form.Control value={dznText.name} onChange={event => setDznText({name: event.target.value, body: dznText.body})} 
                                    type="text" className="bg-transparent text-white" style={{ height: "10%", border: "none"}} />
                                <div style={{ height: "90%", position: "relative" }}>
                                    <Form.Control value={dznText.body} onChange={event => setDznText({name: dznText.name, body: event.target.value})} 
                                        className="bg-transparent h-100 text-white scrollbar scrollbar-primary" as="textarea" 
                                        style={{ resize: "none", border: "none", whiteSpace: "pre", cursor: "auto" }}/>
                                    <div className="d-flex flex-column" style={{ bottom: "3%", right: "2%", position: "absolute" }}>
                                        <Button className="mb-1" size="sm" variant="info" onClick={updateDzn}>
                                            UPDATE
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={deleteDzn}>
                                            DELETE
                                        </Button>
                                    </div>
                                </div>
                            </div> : <></>}
                    </Form.Group>
                </Form>
            </Row>
        </div>
    ); 
}
