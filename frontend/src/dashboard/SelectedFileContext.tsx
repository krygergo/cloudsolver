import { createContext, ReactNode, useContext, useState } from "react";
import { UserFile } from "../user/file/FileModel";

type SetFile = React.Dispatch<React.SetStateAction<UserFile | undefined>>;

interface SelectedFile {
    mzn?: UserFile,
    setMzn: SetFile,
    dzn?: UserFile
    setDzn: SetFile
}

export type SelectType = { file?: UserFile, setFile: SetFile }

const SelectedFileContext = createContext<SelectedFile | undefined>(undefined);

export function useSelectedFile() {
    return useContext(SelectedFileContext);
}

export default function SelectedFileProvider({children}: {children: ReactNode}) {
    const [selectedMZN, setSelectedMZN] = useState<UserFile>();
    const [selectedDZN, setSelectedDZN] = useState<UserFile>();

    return (
        <SelectedFileContext.Provider value={{
            mzn: selectedMZN,
            setMzn: setSelectedMZN,
            dzn: selectedDZN,
            setDzn: setSelectedDZN
        }}>{children}</SelectedFileContext.Provider>
    )
}