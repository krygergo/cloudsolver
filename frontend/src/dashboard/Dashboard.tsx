import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Row, Col, ListGroup, Form, Button, FormGroup, Card } from 'react-bootstrap';
import { deletSolverJob, getSupportedSolvers, submitSolverJob } from '../solver/SolverService';
import { UserFile } from '../user/file/FileModel';
import { deleteFile, getFileBinary, getFileByNameListen, getFiles, postFile, putFileBinary, putFileName } from '../user/file/fileService';
import FileProvider, { FileSelect, useFile } from './FileContext';
import JobProvider, { Job, useJobs } from './JobContext';

export default function Dashboard() {
    return (
        <div className="d-flex text-white">
            <FileProvider>
                <Col className="col-2" >
                    <Files/>
                </Col>
                <Col className="col-4 pe-1">
                    <FileIO/>
                </Col>
                <JobProvider>
                    <Col className="col-2 h-100">
                        <Row style={{ height: "55vh", width: "100%", overflow: "hidden" }}>
                            <Col className="h-100 w-100">
                                <Jobs/>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="h-100 w-100">
                                <SolverConfiguration/>
                            </Col>
                        </Row>
                    </Col>
                    <Col className="col-4">
                        <JobOutput/>
                    </Col>
                </JobProvider>
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
    const [shouldFetch, setShouldFetch] = useState(true);
    const { selected, files, setFiles } = useFile()!;

    useEffect(() => {
        const emptyText = {name: "", body: ""};
        (async () => {
            if(selected.mzn.get && shouldFetch) {
                const mzn = selected.mzn.get;
                const fileBinary = await getFileBinary(mzn.fileBinaryId);
                setMznText({name: mzn.name, body: fileBinary.binary});
            } else if(!selected.mzn.get && shouldFetch) {
                setMznText(emptyText);
            } else {
                setShouldFetch(true);
            }
            if(selected.dzn.get && shouldFetch) {
                const dzn = selected.dzn.get;
                const fileBinary = await getFileBinary(dzn.fileBinaryId);
                setDznText({name: dzn.name, body: fileBinary.binary});
            } else if(!selected.mzn.get && shouldFetch) {
                setDznText(emptyText);
            } else {
                setShouldFetch(true);
            }
        })();
    }, [selected]);

    function updateMzn(event: React.MouseEvent<HTMLElement, MouseEvent>) {
        event.preventDefault();
        putFileBinary(selected.mzn.get?.id!, mznText.body);
        if(mznText.name !== selected.mzn.get?.name) {
            putFileName(selected.mzn.get?.id!, mznText.name);
            const newFile = { ...selected.mzn.get!, name: mznText.name };
            setFiles(files.map(file => file.name !== selected.mzn.get?.name ? file : newFile));
            selected.mzn.set(newFile);
            setShouldFetch(false);
        }
    }

    function deleteMzn() {
        const mzn = selected.mzn;
        deleteFile(mzn.get?.id!);
        setFiles(files.filter(file => file.id !== mzn.get?.id!));
        mzn.set(undefined);
    }

    function updateDzn() {
        putFileBinary(selected.dzn.get?.id!, dznText.body);
        if(dznText.name !== selected.dzn.get?.name) {
            putFileName(selected.dzn.get?.id!, dznText.name);
            const newFile = { ...selected.dzn.get!, name: dznText.name };
            setFiles(files.map(file => file.name !== selected.dzn.get?.name ? file : newFile));
            selected.dzn.set(newFile);
        }
    }

    function deleteDzn() {
        const dzn = selected.dzn;
        deleteFile(dzn.get?.id!);
        setFiles(files.filter(file => file.id !== dzn.get?.id!));
        dzn.set(undefined);
    }

    return (
        <>
            <Row style={{ height: "44vh" }}>
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
            </Row>
            <Row style={{ height: "44vh" }}>
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
            </Row>
        </>
    ); 
}

function Jobs() {
    const {jobs, setJobOutput, jobOutput } = useJobs()!;

    function onJobClick(job: Job) {
        return (_: any) => {
            if(jobOutput?.id === job.id) {
                setJobOutput(undefined);
            } else {
                setJobOutput(job);
            }
        }
    }

    return (
        <>
            <div className="w-100 d-flex justify-content-center">
                <b>Current Jobs</b>
            </div>
            <div style={{ width: "100%", height: "90%", overflowY: "scroll", paddingRight: "29px", boxSizing: "content-box" }}>
                <ListGroup className="w-100">
                    {jobs.map(job => {
                        return (
                            <ListGroup.Item action 
                                onClick={onJobClick(job)}
                                className={`d-flex flex-column mb-1 ${job.id === jobOutput?.id ? "" : "bg-transparent text-white"}`} 
                                style={{ borderLeft: "none", borderRight: "none"}}>
                                <small>{new Date(job.createdAt).toString().slice(0, 24)}</small>
                                <small>{job.status}</small>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </div>
        </>
    );
}

function JobOutput() {
    const { jobOutput, setJobOutput } = useJobs()!;
    const { files } = useFile()!;

    function onJobDelete(_: any) {
        deletSolverJob(jobOutput?.id!);
        setJobOutput(undefined);
    }

    return (
        <>
            {!jobOutput ? <></> :
            <>
            <div className="w-100 d-flex justify-content-center">
                <b>
                    Job data
                    <hr style={{ marginTop: "0px" }}/>
                </b>
            </div>
            <div className="d-flex flex-column w-100">
                <b>mzn file: {files.find(file => file.id === jobOutput.mznFileId)?.name}</b>
                <b>dzn file: {files.find(file => file.id === jobOutput.dznFileId)?.name}</b>
                <b>created at: {new Date(jobOutput.createdAt).toString().slice(0, 24)}</b>
                {jobOutput.finishedAt ? <b>finished at: {new Date(jobOutput.finishedAt).toString().slice(0, 24)}</b> : <b>finished at:</b>}
                <b>flags: {Object.keys(jobOutput.config).map(key => `${key} ${jobOutput.config[key]}`).toString()}</b>
                <b>vCPU: {jobOutput.vCPUMax}</b>
                <b>memory: {jobOutput.memoryMax}</b>
                <b>solvers: {jobOutput.solvers.toString()}</b>
                <div className="d-flex justify-content-end">
                    <Button onClick={onJobDelete} variant="danger">Delete</Button>
                </div>
                <div className="w-100 d-flex justify-content-center">
                    <b>
                        Job output
                        <hr style={{ marginTop: "0px" }}/>
                    </b>
                </div>
                <b>fastest solution: {jobOutput.result?.solver}</b>
                <Card className="bg-transparent" style={{ width: "100%", borderBottom: "none", borderLeft: "none", borderRight: "none"}}>
                    <Card.Body >
                        <div className="w-100 d-flex justify-content-center">
                            <Card.Title>RESULT</Card.Title>
                        </div>
                        <div className="scrollbar scrollbar-primary" style={{ height: "50vh", overflowY: "scroll" }}>
                            <Card.Text>
                                {jobOutput.result?.output}
                            </Card.Text>
                        </div>
                    </Card.Body>
                </Card>
            </div>
            </>
            }
        </>
    );
}

function SolverConfiguration() {
    const [selectedSolvers, setSelectedSolvers] = useState<string[]>([]);
    const [supportedSolvers, setSupportedSolvers] = useState<string[]>([]);
    const vCPURef = useRef<HTMLInputElement>(null);
    const memoryRef = useRef<HTMLInputElement>(null);
    const flagsRef = useRef<HTMLInputElement>(null);
    const { selected } = useFile()!;

    useEffect(() => {
        (async () => {
            const solvers = await getSupportedSolvers();
            if(solvers.length > 0)
                setSupportedSolvers(solvers)
        })();
    }, []);

    function onSolverSelect(solver: string) {
        return (_: any) => {
            const newSelectedSolvers = selectedSolvers.filter(selectedSolver => selectedSolver !== solver);
            if(selectedSolvers.length !== newSelectedSolvers.length)
                return setSelectedSolvers(newSelectedSolvers);
            setSelectedSolvers([...selectedSolvers, solver]);
        }
    }

    function onJobSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        if(!selected.mzn.get)
            return;
        if(!selected.dzn.get)
            return;
        if(selectedSolvers.length === 0)
            return;
        submitSolverJob({
            mznFileId: selected.mzn.get.id,
            dznFileId: selected.dzn.get.id,
            solvers: selectedSolvers,
            vCPU: Number(vCPURef.current?.value) || undefined,
            memory: Number(memoryRef.current?.value) || undefined,
            config: flagsRef.current?.value
        });
    }

    return (
        <>
            <Row>
                <div className="d-flex justify-content-center mb-2">
                    <b>
                        Supported Solvers
                    </b>
                </div>
            </Row>
            <Row style={{ height: "14vh", width: "100%", marginRight: "-4px", marginLeft: "-4px", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", overflowY: "scroll", boxSizing: "content-box" }}>
                    <ListGroup style={{ width: "100%" }}>
                        {supportedSolvers.map(solver => {
                            return (
                                <ListGroup.Item className={`${selectedSolvers.find(selectedSolver => selectedSolver === solver) ? "bg-primary" : "bg-transparent"} mb-1 text-white`}
                                    action onClick={onSolverSelect(solver)}>
                                    {solver}
                                </ListGroup.Item>
                            );
                        })}    
                    </ListGroup>
                </div>
            </Row>
            <Row>
                <Form onSubmit={onJobSubmit}>
                    <FormGroup>
                        <Form.Control ref={vCPURef} className="mb-2" type="number" placeholder="vCPU"/>
                    </FormGroup>
                    <FormGroup>
                        <Form.Control ref={memoryRef} className="mb-2" type="number" placeholder="memory"/>
                    </FormGroup>
                    <FormGroup>
                        <Form.Control ref={flagsRef} className="mb-2" type="text" placeholder="flags"/>
                    </FormGroup>
                    <Button type="submit" style={{ width: "100%" }}>Submit Job</Button>
                </Form>
            </Row>
        </>
    )
}
