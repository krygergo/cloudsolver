import { createContext, ReactNode, useContext, useState } from "react";
import { UserFile } from "../user/file/FileModel";

export type SetUserFile = React.Dispatch<React.SetStateAction<UserFile | undefined>>;
export type SetFiles = React.Dispatch<React.SetStateAction<UserFile[]>>
export type FileSelect = {
    get?: UserFile;
    set: SetUserFile;
}

interface FileData {
    selected: {
        mzn: {
            get?: UserFile
            set: SetUserFile
        }
        dzn: {
            get?: UserFile
            set: SetUserFile
        }
    }
    files: UserFile[]
    setFiles: SetFiles
}

const FileContext = createContext<FileData | undefined>(undefined);

export const useFile = () => useContext(FileContext);

export default function FileProvider({children}: {children: ReactNode}) {
    const [selectedMZN, setSelectedMZN] = useState<UserFile>();
    const [selectedDZN, setSelectedDZN] = useState<UserFile>();
    const [files, setFiles] = useState<UserFile[]>([]);

    return (
        <FileContext.Provider value={{
            selected: {
                mzn: {
                    get: selectedMZN,
                    set: setSelectedMZN
                },
                dzn: {
                    get: selectedDZN,
                    set: setSelectedDZN
                }
            },
            files: files,
            setFiles: setFiles
        }}>{children}</FileContext.Provider>
    )
}