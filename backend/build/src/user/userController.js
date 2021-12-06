"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const auth_1 = require("../auth/auth");
const userService_1 = require("./userService");
const route = (0, express_1.Router)();
exports.route = route;
route.get("/", async (req, res) => {
    const user = (await (0, userService_1.getUserById)(req.session.userId));
    const userResponse = (({ id, hashedPassword, ...rest }) => rest)(user);
    res.send(userResponse);
});
route.delete("/:userId", auth_1.auth, async (req, res) => {
    const userId = req.session.userId;
    await (0, userService_1.deleteUserById)(userId);
    res.sendStatus(200);
});
//# sourceMappingURL=userController.js.map