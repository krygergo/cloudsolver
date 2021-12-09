import supertest from "supertest"
import app from "../../src/app";

jest.mock("../../src/user/userService", () => ({
    addUser: jest.fn((username: string, _: string) => username !== "test" ? "userId" : undefined)
}));

describe("POST /signup", () => {
    it("Returns status code 201 if non existing username is passed", async () => {
        const res = await supertest(app)
            .post("/signup")
            .send({
                username: "username",
                password: "password"
            });
        expect(res.statusCode).toBe(201);
    });

    it("Returns status code 403 if existing username is passed", async () => {
        const res = await supertest(app)
            .post("/signup")
            .send({
                username: "test",
                password: "password"
            });
        expect(res.statusCode).toBe(403)
    });
});
