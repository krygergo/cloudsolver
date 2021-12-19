import { useEffect, useRef } from "react";
import { createContext, ReactNode, useContext, useState } from "react";
import { env } from "../config/environment";

export type SetJobOutput = React.Dispatch<React.SetStateAction<Job | undefined>>;

interface JobChange {
    type: "added" | "modified" | "removed"
    job: Job
}

export interface Job {
    id: string
    mznFileId: string
    dznFileId: string
    config: {[key: string]: any}
    result?: Result
    createdAt: number
    finishedAt?: number
    memoryMax: number
    vCPUMax: number
    solvers: string[]
    status: Status
}

interface Result {
    solver: string
    output: string
}

export type Status = "RUNNING" | "FINISHED" | "QUEUED"

const JobContext = createContext<{jobs: Job[], jobOutput?: Job, setJobOutput: SetJobOutput} | undefined>(undefined);

export const useJobs = () => useContext(JobContext);

export default function JobProvider({children}: {children: ReactNode}) {
    const [jobs, _setJobs] = useState<Job[]>([]);
    const jobRef = useRef<Job[]>(jobs);
    const [loading, setLoading] = useState(true);
    const [jobOutput, setJobOutput] = useState<Job>();

    const setJobs = (newJobs: Job[]) => {
        jobRef.current = newJobs;
        _setJobs(newJobs);
    }

    useEffect(() => {
        const eventSource = new EventSource(`${env.REACT_APP_EXPRESS_URL}/solver/job/listen`, {withCredentials: true});
        eventSource.addEventListener("message", message => {
            const jobChanges = JSON.parse(message.data) as JobChange[];
            const newJobs = jobChanges.reduce<Job[]>((list, jobChange) => {
                if(jobChange.type === "added" && !list.find((job) => job.id === jobChange.job.id))
                    return [...list, jobChange.job];
                else if(jobChange.type === "modified")
                    return list.map(job => job.id === jobChange.job.id ? jobChange.job : job);
                else
                    return list.filter(job => job.id !== jobChange.job.id);
            }, jobRef.current);
            setJobs(newJobs.sort((aJob, bJob) => bJob.createdAt - aJob.createdAt));
            setLoading(false);
        });

        return () => {
            eventSource.close();
        }
    }, []);

    return (
        <JobContext.Provider value={{jobs: jobs, jobOutput: jobOutput, setJobOutput: setJobOutput}}>
            {!loading && children}
        </JobContext.Provider>
    )
}