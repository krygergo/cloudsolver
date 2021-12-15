import supertest from "supertest"
import app from "../../src/app";
import { isAdmin } from "../../src/user/userModel";
import { getUserById } from "../../src/user/userService";

let admin:boolean = true;

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
    }),
    verifyUserAdminRight: jest.fn(async (userId: string) => { 
        const user = await getUserById(userId);
        if (!user)
            return undefined;
        return isAdmin(user.userRight);
    })
}))

jest.mock("../../src/session/sessionService", () => ({
    getUserSessionById: jest.fn(()  => {
        if (admin === true) {
            var sessionId = { 
                userId: "1"
                }
            return sessionId 
        }
        else if (admin === false) {
            var sessionId2 = {
                userId: "2"
            }
            return sessionId2
        }
    })
}))

describe("Checking users/Deleting users", () => {
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
            admin = false
            const cookie = res.header["set-cookie"][1] as string;
            await supertest(app).delete("/admin/user/2").set('Cookie', cookie).send(req).expect(403)
        });
    it("Checking files in solver", async () => {
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
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        await supertest(app).post("/admin/solver").set('Cookie', cookie).send(req).expect(404)
    })
});


