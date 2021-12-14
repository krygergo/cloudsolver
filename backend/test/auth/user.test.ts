
import supertest from "supertest"
import app from "../../src/app";


jest.mock("../../src/user/userService", () => ({
    getUserByUsername: jest.fn((username: string) => {
        if (username === "adminUser")
            return {"id" : "1"}
        else if (username === "normalUser")
            return {"id" : "2"}
        return undefined
    }),
    verifyUserPassword: jest.fn((userPassword: string, _: string) => userPassword === "correctPass" ? true : undefined),
    
    getUserById: jest.fn((id: string)  => {
        if (id === "1") {
            var adminUser = { 
                userId: "1",
                userRight: "ADMIN"
                }
            return adminUser  
        }
        else if (id === "2") {
            var normalUser = {
                userId: "2",
                userRight: "DEFAULT"
            }
            return normalUser
        }
        return undefined
         }),
    deleteUserById: jest.fn((userid: string)  => {
        if (userid === "2")
            return undefined
        
    })
}))


jest.mock("../../src/session/sessionService", () => ({
    getUserSessionById: jest.fn(()  => {
        var sessionId = { 
            userId: "1"
            }
        return sessionId     
         }) 
}))


describe("Checking users", () => {
    it("Access userprofiles with cookie", async () => {
        const req = {
                "username" : "adminUser",
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
    it("Delete user whilst admin", async () => {
        const req = {
                "username" : "adminUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "1"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
            await supertest(app).delete("/admin/user/2").set('Cookie', cookie).send(req).expect(200)
                 
   
        });
    /*
    it("Delete user whilst not admin", async () => {
        const req = {
                "username" : "normalUser",
                "password" : "correctPass",
            "session" : {
                    "userId" : "2"
                }
            }
        const res = await supertest(app)
            .post("/login")
            .send(req);
            const cookie = res.header["set-cookie"][1] as string;
            await supertest(app).delete("/user/2").set('Cookie', cookie).send(req).expect(200)
                    
    
        });
        */

});



