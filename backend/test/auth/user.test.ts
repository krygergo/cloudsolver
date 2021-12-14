import { Cookie, SessionData } from "express-session";
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
        if (id === "1")
            return id
        return undefined
            
         })
}));

jest.mock("../../src/session/sessionService", () => ({
    getUserSessionById: jest.fn(()  => {
        var sessionId = { 
            userId: "1",
            }
        return sessionId     
         }) 
}))


describe("Checking users", () => {
    it("Access userprofiles with cookie", async () => {
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
            await supertest(app).get("/user").set('Cookie', cookie).expect(200)        
   
        });
    it("Check users without cookie", ()  => 
        supertest(app).get("/user").expect(401)
    )
});


