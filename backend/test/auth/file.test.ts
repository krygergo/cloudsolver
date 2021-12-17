import supertest from "supertest"
import app from "../../src/app";

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
        return {
            getAllFiles
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
        const res2 = await supertest(app).get("/file").set("Cookie", cookie)
        expect(res2.statusCode).toBe(200)
    });
})

describe("POST /file - verifyMinizincFile", () => {
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