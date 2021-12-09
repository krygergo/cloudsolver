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


describe("Logging in.", () => {
    it("Logging in with correct credentials", async () => {
        const req = {
                "username" : "existingUser",
                "password" : "correctPass",
            "session" : {
                "userId" : "undefined"
            }
        }
        const res = await supertest(app)
            .post("/login")
            .send(req);
        expect(res.statusCode).toBe(200);

    });


    it("Logging in with wrong credentials", async () => {
        const res = await supertest(app)
            .post("/login")
            .send({
                username: "existingUser",
                password: "wrongPass"
            });
        expect(res.statusCode).toBe(403);
    });

    it("Logging in when user does not exist", async () => {
        const res = await supertest(app)
            .post("/login")
            .send({
                username: "NotAUser",
                password: "Anything"
            });
        expect(res.statusCode).toBe(403);
    });

})