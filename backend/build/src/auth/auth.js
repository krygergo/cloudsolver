"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.auth = void 0;
const userService_1 = require("../user/userService");
const auth = async (req, res, next) => {
    if (!("password" in req.body) || typeof req.body.password !== "string")
        return res.status(403).send("Must authenticate with password");
    const password = req.body.password;
    const user = await (0, userService_1.getUserById)(req.session.userId);
    if (!user)
        return res.status(403).send("User doesn't exist");
    if (!(0, userService_1.verifyUserPassword)(password, user.hashedPassword))
        return res.status(403).send("Wrong credentials");
    next();
};
exports.auth = auth;
const login = async (req, res) => {
    const credentials = req.body;
    const user = await (0, userService_1.getUserByUsername)(credentials.username);
    if (!user)
        return res.status(403).send("User doesn't exist");
    if (!(0, userService_1.verifyUserPassword)(credentials.password, user.hashedPassword))
        return res.status(403).send("Wrong credentials");
    req.session.userId = user.id;
    res.status(200).send("Successfully log in");
};
exports.login = login;
//# sourceMappingURL=auth.js.map