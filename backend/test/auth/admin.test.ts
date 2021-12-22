import supertest from "supertest"
import app from "../../src/app";
import { isAdmin } from "../../src/user/userModel";
import { getUserById } from "../../src/user/userService";
import { UploadedFile } from "express-fileupload";
import { SolverFlagCollection } from "../../src/admin/flagFileModel";
import { v4 as uuid } from "uuid";
import { asSingleFile } from "../../src/config/fileConfig";

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

jest.mock("../../src/admin/flagFileService", () => ({
    verifyFlagFile: jest.fn((flagfile: UploadedFile) => {
        const myFlagFile = asSingleFile(flagfile);
        if (!flagfile)
            return { status: false, message: "You can only upload one flagtext file at once." };
        if (flagfile.name.length <= ".txt".length)
            return { status: false, message: "The flag text file must have a name!" };
        if (flagfile.name.slice(flagfile.name.length - ".txt".length) !== ".txt")
            return { status: false, message: "The file extension must be .txt" };
        return { status: true, message: "success!" }
    }),
    
    verifySolverFile: jest.fn((solverFile: UploadedFile) => {
        const mySolverFile = asSingleFile(solverFile);
        if (!mySolverFile)
            return { status: false, message: "You can only upload one solver file at once." };
        if (mySolverFile.name.length <= ".tar.gz".length)
            return { status: false, message: "The solverfile must have a name!" };
        if (mySolverFile.name.slice(mySolverFile.name.length - ".tar.gz".length) !== ".tar.gz")
            return { status: false, message: "The file extension must be .tar.gz" };
        return { status: true, message: "success!" }
    }),
    
    
    /**
     * get,update and delete flagfiles
     */
     fileByName: jest.fn((filename: string) => {
        const solvercollection = SolverFlagCollection()
        const query = solvercollection.where("name", "==", filename);
    
        const getFile = async () => {
            const fileSnapshot = await query.get();
            if(fileSnapshot.empty)
                return undefined;
            return fileSnapshot.docs[0].data()!;
        }
    
        const updateFileData = async (input: string) => {
            const file = await getFile();
            if(!file)
                return undefined;
            return solvercollection.doc(file.id).update({data : input, updatedAt: Date.now()})
        }
    
        const deleteFile = async () => {
            const file = await getFile();
            if(!file)
                return undefined;
            return solvercollection.doc(file.id).delete();
        }
    
        return {
            getFile,
            updateFileData,
            deleteFile
        }
    }),
    
    uploadNewFlagFile: jest.fn(( async (flagFile: UploadedFile) => {
            if(flagFile.name.slice(0, flagFile.name.length-".txt".length) === "test")
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

describe("/solver admin tests", () => {
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
    describe("Flag file tests", () => { 
        it("Added solverfile, but added multiple flagfiles, which gives error", async () => {
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
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).attach("flagfile", filePath).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("You can only upload one flagtext file at once.")
        })
        it("Added a flagfile with no name", async () => {
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
            const filePath2 = "../backend/test/testfiles/.txt";
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("The flag text file must have a name!")
        })
        it("Added a fileextension which is not a .txt file", async () => {
            const req = {
                "username" : "adminUser",
                "password" : "correctPass",
                }
            const res = await supertest(app)
            .post("/login")
            .send(req);
            admin = true
            const cookie = res.header["set-cookie"][1] as string;
            const filePath = "../backend/test/testfiles/allinterval.mzn";
            const filePath2 = "../backend/test/testfiles/test.tar.gz";
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("The file extension must be .txt")
        })
    describe("Solver file tests", () => {
        it("Added correct flag file, but added multiple solverfiles, which gives error", async () => {
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
            const filePath2 = "../backend/test/testfiles/test.txt";
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("solverfile", filePath2).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("You can only upload one solver file at once.")
        })
        it("Added correct flag file, but added multiple solverfiles with no name", async () => {
            const req = {
                "username" : "adminUser",
                "password" : "correctPass",
                }
            const res = await supertest(app)
            .post("/login")
            .send(req);
            admin = true
            const cookie = res.header["set-cookie"][1] as string;
            const filePath = "../backend/test/testfiles/.tar.gz";
            const filePath2 = "../backend/test/testfiles/test.txt";
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("The solverfile must have a name!")
        })
        it("Added correct flag file, but added multiple solverfiles with no name", async () => {
            const req = {
                "username" : "adminUser",
                "password" : "correctPass",
                }
            const res = await supertest(app)
            .post("/login")
            .send(req);
            admin = true
            const cookie = res.header["set-cookie"][1] as string;
            const filePath = "../backend/test/testfiles/test.txt";
            const filePath2 = "../backend/test/testfiles/test.txt";
            const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("The file extension must be .tar.gz")
        })
    })
})

})

describe("/solver admin tests continued", () => {
    it("Added solver/flag file, but not same name", async () => {
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
        const filePath2 = "../backend/test/testfiles/existing.txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Names of the files must match")
    })
    it("Added existing solverfile", async () => {
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
        const filePath2 = "../backend/test/testfiles/existing.txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("The file already exists or an unexpected error occured.")
    })
    it("Added existing solverfile", async () => {
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
        const filePath2 = "../backend/test/testfiles/test.txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Could not upload flag file")
    })
    it("Added existing solverfile", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/newfile.tar.gz";
        const filePath2 = "../backend/test/testfiles/newfile.txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
        expect(res2.statusCode).toBe(201)
        expect(res2.text).toBe("Successfully uploaded the solverfile & flagfile.")
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

/*
describe("Testing PUT request for /:solverName/flagFile", () => {
    it("Added existing solverfile", async () => {
        const req = {
            "username" : "adminUser",
            "password" : "correctPass",
            }
        const res = await supertest(app)
        .post("/login")
        .send(req);
        admin = true
        const cookie = res.header["set-cookie"][1] as string;
        const filePath = "../backend/test/testfiles/newfile.tar.gz";
        const filePath2 = "../backend/test/testfiles/newfile.txt";
        const res2 = await supertest(app).post("/admin/solver").attach("solverfile", filePath).attach("flagfile", filePath2).field(req).set('Cookie', cookie)
        console.log(res2)
    })
    */



