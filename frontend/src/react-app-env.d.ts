/// <reference types="react-scripts" />

export interface Environment {
    REACT_APP_EXPRESS_URL: string
    REACT_APP_DOMAIN: string
    NODE_ENV: string
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Environment {}
    }
}