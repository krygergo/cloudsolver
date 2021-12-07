import supertest from "supertest";
import { corsConfig, app } from "../src/app";
import request from "supertest";
import { response } from "express";
import { doesNotMatch } from "assert";


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


describe("POST /signup", () => {
    it("returns status code 201 if first name is passed", async () => {
      const res = await request(app)
        .post("/")
        .send(
            { username: "test",
            password: "teest"
        
        });
        
      // toEqual recursively checks every field of an object or array.
      expect(res.statusCode).toEqual(201);
    });
});