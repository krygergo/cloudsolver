"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const userService_1 = require("../user/userService");
const signup = async (req, res) => {
    const credentials = req.body;
    const userId = await (0, userService_1.addUser)(credentials.username, credentials.password);
    if (!userId)
        return res.status(403).send("User allready exists");
    req.session.userId = userId;
    res.status(201).send("Successfully sign up");
};
exports.signup = signup;
//# sourceMappingURL=signup.js.map