import supertest from "supertest"
import app from "../../src/app";

jest.mock("../../src/user/userService", () => ({
    getUserByUsername: jest.fn((username: string) => {
        if (username === "existingUser")
            return {"id" : "1"}
        
        return undefined
    }),
    verifyUserPassword: jest.fn((userPassword: string, _: string) => userPassword === "correctPass" ? true : undefined),
    
    getUserById: jest.fn((id: string)  => {
        if (id === "1") {
            var existingUser = { 
                userId: "1",
                userRight: "DEFAULT"
                }
            return existingUser 
        }
        return undefined
         }),
}))

jest.mock("../../src/session/sessionService", () => ({
    getUserSessionById: jest.fn(()  => {
            var sessionId = { 
                userId: "1"
                }
            return sessionId 
    })
}))

describe("/solver post requests", () => {
    it("no dzn body", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
        const req1 = {
                "mznFileId" : "file.mzn",
            }
            const res1 = await supertest(app).post("/solver").set('Cookie', cookie).send(req1)
            expect(res1.text).toBe("No dznField")
            expect(res1.statusCode).toBe(400)
        });
    
    it("no mzn body", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
        const req1 = {
                "dznFileId" : "file.dzn",
            }
            const res1 = await supertest(app).post("/solver").set('Cookie', cookie).send(req1)
            expect(res1.text).toBe("No mznField")
            expect(res1.statusCode).toBe(400)
        });
    it("No solvers", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
        const req1 = {
                "dznFileId" : "file.dzn",
                "mznFileId" : "file.mzn",
            }
            const res1 = await supertest(app).post("/solver").set('Cookie', cookie).send(req1)
            expect(res1.text).toBe("No solvers")
            expect(res1.statusCode).toBe(400)
        })
    it("Solvers field must be of type array", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
        const req1 = {
                "dznFileId" : "file.dzn",
                "mznFileId" : "file.mzn",
                "solvers"   : "solver"
            }
            const res1 = await supertest(app).post("/solver").set('Cookie', cookie).send(req1)
            expect(res1.text).toBe("Solvers field must be of type array")
            expect(res1.statusCode).toBe(400)
        })
    /*
    it("Error in request body", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
        const req1 = {
                "dznFileId" : "file.dzn",
                "mznFileId" : "file.mzn",
                "solvers": ["solver.solver","solve2.solver"]
            }
            const res1 = await supertest(app).post("/solver").set('Cookie', cookie).send(req1)
            expect(res1.text).toBe("Error in request body")
            expect(res1.statusCode).toBe(400)
        })
    */
})