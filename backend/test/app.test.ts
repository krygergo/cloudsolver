import supertest from "supertest";
import { corsConfig, app } from "../src/app";

describe("Test cors config",
    () => test("Verify",
        () => {
            expect(corsConfig.credentials).toBe(true);
        }
    )
);

describe("Test root path", 
    () => test("GET method response", 
        () => supertest(app).get("/").expect(200)
    )
);