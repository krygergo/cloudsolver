import supertest from "supertest"
import app from "../../src/app";
import { isAdmin } from "../../src/user/userModel";
import { getUserById } from "../../src/user/userService";
import { UploadedFile } from "express-fileupload";

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
    }),

    updateUserResourcesById: jest.fn(( async (userId: string, vCPUMax?: number, memoryMax?: number) => {
        const updateObject = (vCPUMax?: number, memoryMax?: number) => vCPUMax && memoryMax
            ? { vCPUMax: vCPUMax, memoryMax: memoryMax } : vCPUMax
                ? { vCPUMax: vCPUMax } : { memoryMax: memoryMax! }
        updateObject(vCPUMax, memoryMax)
        if(!updateObject)
            return false
        if(userId === "2")
            return true
        if(userId === "1")
            return true
        return undefined
    })) 
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

jest.mock("../../src/solver/file/solverFileService", () => ({
    addSolverFile: jest.fn((async (fileUpload: UploadedFile) => {
        if(fileUpload.name.slice(0, fileUpload.name.length-".tar.gz".length) === "existing")
            return undefined
        return true
    }))
}))
    

describe("Deleting users", () => {
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
    });

describe("/solver admin rights", () => {
    it("file not found", async () => {
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
        const res2 = await supertest(app).post("/admin/solver").set('Cookie', cookie).send(req)
        expect(res2.statusCode).toBe(404)
        expect(res2.text).toBe("File not found!")
    })
    it("Wrong type of file", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/yoda.jpg";
        const res2 = await supertest(app).post("/admin/solver").attach("file", filePath).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Wrong type of file!")
    })
    it("Added solverfile, but added multiple, which gives error", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/yoda.jpg";
        const filePath2 = "../backend/test/testfiles/allinterval.mzn";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("solverfile", filePath2).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("You can only upload one file at once.")
    })
    it("Added a solver with no name", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/ .txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("The solver must have a name!")
    })
    it("Added a solver but with no .tar.gz. extension", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/yoda.jpg";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(415)
        expect(res2.text).toBe("The file extension must be .tar.gz.")
    })
    it("Added tar.gz solver file, but already exists", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/existing.tar.gz";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("The file already exists or an unexpected error occured.")
    })
    it("Succesfully uploaded new solverfile", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/test.tar.gz";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(201)
        expect(res2.text).toBe("Successfully uploaded the solverfile.")
    })
})

describe("/put updating a user's maximum amount of vCPUs and memory", () => {
    it("Error, no vCPUMax or memoryMax specified", async () => {
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
            const res2 = await supertest(app).put("/admin/user/2").set('Cookie', cookie).send(req)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No vCPUMax or memoryMax specified")
    });
    it("Error, vCPUMax specified, but wrong userid", async () => {
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
            const res2 = await supertest(app).put("/admin/user/3").set('Cookie', cookie).send(req).send({"vCPUMax": "4"})
        expect(res2.statusCode).toBe(400)
    });
    it("Succesfully updated resources", async () => {
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
            const res2 = await supertest(app).put("/admin/user/2").set('Cookie', cookie).send(req).send({"vCPUMax": "4"})
        expect(res2.statusCode).toBe(200)
    });
})





