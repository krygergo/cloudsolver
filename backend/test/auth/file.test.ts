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
            return ["existing"]
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
            
            const getFile = async () => {
                const fileSnapshot = query(name);
                if(!fileSnapshot)
                    return undefined;
                return "File";
            }
            return {
                get: getFile
            }
        }

        const fileById = (fileId: string) => {
            const getFile = async () => {
                if (fileId === "01")
                    return true
                else   
                    return undefined
            }
            const updateFileData = async (binary: string) => {
                const file = await getFile();
                if(!file)
                    return undefined;
                return true
            }

            const updateFileName = async (name: string) => {
                const allFiles = await getAllFiles();
                const filtered = allFiles.filter(f => name === "existing");
                if (filtered.length > 0)
                    return undefined;
                return getFile()
            }
            const deleteFile = async () => {
                const file = await getFile();
                if(!file)
                    return undefined;
                return true
            }
        
            return {
                get: getFile,
                updateFileData,
                updateFileName,
                deleteFile
                
            }
        }
        return {
            getAllFiles,
            addFile,  
            fileByName,
            fileById
        }
    }
)}));

jest.mock("../../src/user/file/binary/fileBinaryService", () => ({
    FileBinaryService: jest.fn((userId: string)  => {
    
        const getFileBinaryById = async (fileBinaryId: string) => {
            if(userId === "1" && fileBinaryId === "01")
                return true
            else  
                return undefined
        }
        return {
            getFileBinaryById
        }
    })
}))


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

        const filePath = "../backend/test/testfiles/allinterval.mzn";
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

        const filePath = "../backend/test/testfiles/yoda.jpg";
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

        const filePath = "../backend/test/testfiles/yoda.jpg";
        const filePath2 = "../backend/test/testfiles/allinterval.mzn";
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

        const filePath = "../backend/test/testfiles/yoda.jpg";
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

        const filePath = "../backend/test/testfiles/empty.mzn";
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

        const filePath = "../backend/test/testfiles/existing.mzn";
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

        const filePath = "../backend/test/testfiles/allinterval.mzn";
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

describe("GET /file/binary/:fileBinaryId", () => {
    it("Get binary file by binary id with existing file", async () => {
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
        const res2 = await supertest(app).get("/file/binary/01").set("Cookie", cookie)
        expect(res2.statusCode).toBe(200)
    });
    it("Get binary file by binary id with non-existing file", async () => {
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
        const res2 = await supertest(app).get("/file/binary/02").set("Cookie", cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Not found")
    });
})


describe("PUT /file/binary/:fileId", () => {
    it("No binary data provided", async () => {
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
        const res2 = await supertest(app).put("/file/binary/01").set("Cookie", cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No binary data provided.")
        
    });
    it("Data provided but no file", async () => {
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
        const res2 = await supertest(app).put("/file/binary/02").set("Cookie", cookie).send({"binary": "hej"})
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("File does not exist.")
    });
    it("Data provided and file exists", async () => {
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
        const res2 = await supertest(app).put("/file/binary/01").set("Cookie", cookie).send({"binary": "hej"})
        expect(res2.statusCode).toBe(200)
    });
    
})
describe("PUT /name/:fileId", () => {
    it("No query parameter", async () => {
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
        const res2 = await supertest(app).put("/file/name/01").set("Cookie", cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("No query parameter name specified.")
    });
    it("Query parameter given, but no file id", async () => {
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
        const res2 = await supertest(app).put("/file/name/02").set("Cookie", cookie).query({"name" : "per"})
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("File ID does not exist, or the file name already is taken.")
    });
    it("Query parameter given, but existing file name", async () => {
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
        const res2 = await supertest(app).put("/file/name/01").set("Cookie", cookie).query({"name" : "existing"})
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("File ID does not exist, or the file name already is taken.")
    });
    it("Succesfully changed file name", async () => {
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
        const res2 = await supertest(app).put("/file/name/01").set("Cookie", cookie).query({"name" : "newname"})
        expect(res2.statusCode).toBe(200)
    });

})

describe("DELETE /:fileId", () => {
    it("Delete file that doesn't exist", async () => {
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
        const res2 = await supertest(app).delete("/file/02").set("Cookie", cookie)
        expect(res2.statusCode).toBe(400)
        expect(res2.text).toBe("Unable to delete.")
    });
    it("Delete file that exists", async () => {
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
        const res2 = await supertest(app).delete("/file/01").set("Cookie", cookie)
        expect(res2.statusCode).toBe(200)
    });

})

})