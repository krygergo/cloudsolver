/// <reference types="react-scripts" />

export interface Environment {
    REACT_APP_GATEWAY_URL: string
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment {}
    }
}