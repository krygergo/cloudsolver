import supertest from "supertest";
import app, { corsConfig } from "../src/app";

describe("Test cors config",
    () => test("Verify",
        () => {
            expect(corsConfig.origin).toBe("test");
            expect(corsConfig.credentials).toBe(true);
        }
    )
);

describe("Test root path", 
    () => test("GET method response", 
        () => supertest(app).get("/").expect(200)
    )
);

describe("User creation FAIL", () => {
    test("Create user wihtout password again", async () => {
        const user_data2 ={
            "username": "teste2r"
        }

        await supertest(app)
        .post("/signup")
        .send(user_data2)
        .expect(400)

    })

    test("Create user wihtout username", async () => {
        const user_data2 ={
            "password": "teste2r"
        }

        await supertest(app)
        .post("/signup")
        .send(user_data2)
        .expect(400)
    })
});