import supertest from "supertest"
import app from "../../src/app";
//import { getAllFiles } from "../../src/user/file/fileService"


jest.mock("../../src/user/userService", () => ({
    getUserByUsername: jest.fn((username: string) => {
        if (username === "existingUser")
            return {"id" : "1"}
        return undefined
    }),

    verifyUserPassword: jest.fn((userPassword: string, _: string) => userPassword === "correctPass" ? true : undefined)
}));

jest.mock("../../src/session/sessionService", () => ({
    getUserSessionById: jest.fn(()  => {
            var sessionId = { 
                userId: "1"
                }
            return sessionId 
    })
}))

jest.mock("../../src/user/file/fileService", () => ({
    
     FileService: jest.fn((userId: string) => {
       

        const getAllFiles = async () => {
            
            return [];
        }

        const addFile = async(uploadedFile: File) =>{

            if(uploadedFile.name.slice(0, uploadedFile.name.length - 4)=== "existing")
                return undefined;
            else
                return true;
        }


        const fileByName = (fileName: string) => {
            const name = fileName.slice(0, fileName.length -  4);
            const type = fileName.slice(fileName.length - 3);
            const query = (name: string) => {
                if(name === "existing")
                    return true
                else
                    return undefined
            }
            //fileCollection.where("name", "==", name).where("type", "==", type);
            
            const getFile = async () => {
                const fileSnapshot = query(name);
                if(!fileSnapshot)
                    return undefined;
                return "File";
            }
            /*
            const listenOnChange = (req: Request, res: Response) => {
                const unsub = query.onSnapshot(snapshot => {
                    if(!snapshot.empty) {
                        res.send(snapshot.docs[0].data());
                        unsub();
                    }
                },() => res.status(500).send("Error listening on file"));
                req.once("close", () => {
                    unsub();
                    res.end();
                });
            }
            */
            return {
                get: getFile
            }
        }

    
        return {
            getAllFiles,
            addFile,
            fileByName
        }
    }
    
)}));

describe("GET /file", () => {
    it("Get files", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }

        const res = await supertest(app)
            .post("/login")
            .send(req)
        
        const cookie = res.header["set-cookie"][1] as string;
        await supertest(app).get("/file").set("Cookie", cookie)
    });
})


describe("POST /file - upload,verifyMinizincFile", () => {
    it("POST no files uploaded", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const res2 = await supertest(app).post("/file").set("Cookie", cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No file were uploaded")

    });

    it("POST mzn file uploaded but no minizinc field specified", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/allinterval.mzn";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("NOT-minizinc-FIELD", filePath)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No field value minizinc specified")
    });

    it("POST wrong type file uploaded AND no minizinc field", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/babyyoda.jpeg";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("NOT-minizinc-FIELD", filePath)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No field value minizinc specified")
    });

    it("POST multiple files", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/babyyoda.jpeg";
        const filePath2 = "/home/duy/Downloads/allinterval.mzn";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("minizinc", filePath).attach("minizinc", filePath2)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Multiple files uploaded")


    });

    it("POST wrong type file uploaded AND correct minizinc field", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/babyyoda.jpeg";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("minizinc", filePath)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Not a mzn or dzn file")
    });
})

describe("Post /file - upload-addfile", () => {

    it("Upload an empty mzn file", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/empty.mzn";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("minizinc", filePath)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Empty file")

    });

    it("Upload an existing mzn file", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/existing.mzn";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("minizinc", filePath)
        expect(res2.statusCode).toBe(403)
        expect(res2.text).toBe("File allready exists")
    });

    it("Upload a new mzn file", async () => {
        const req = {
            "username" : "existingUser",
            "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req)
        const cookie = res.header["set-cookie"][1] as string;

        const filePath = "/home/duy/Downloads/allinterval.mzn";
        const res2 = await supertest(app).post("/file").set("Cookie", cookie).attach("minizinc", filePath)
        expect(res2.statusCode).toBe(201)
        expect(res2.text).toBe("Successfully uploaded allinterval.mzn")

    });

    describe("GET /file/name/:name", () => {
        it("Get an existing specific file by name", async () => {
            const req = {
                "username" : "existingUser",
                "password" : "correctPass",
                "session" : {
                    "userId" : "undefined"
                }
            }
            const res = await supertest(app)
                .post("/login")
                .send(req)
            
            const cookie = res.header["set-cookie"][1] as string;
            const res2 = await supertest(app).get("/file/name/existing.mzn").set("Cookie", cookie)
            expect(res2.statusCode).toBe(200)
    
    
        });

        it("Get a non-existing file by name", async () => {
            const req = {
                "username" : "existingUser",
                "password" : "correctPass",
                "session" : {
                    "userId" : "undefined"
                }
            }
            const res = await supertest(app)
                .post("/login")
                .send(req)
            const cookie = res.header["set-cookie"][1] as string;
    
            const res2 = await supertest(app).get("/file/name/not.mzn").set("Cookie", cookie)
            expect(res2.statusCode).toBe(400)
            expect(res2.text).toBe("File do not exists")

    
    
        });
    })


    

})