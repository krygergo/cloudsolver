"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.verifyUserPassword = exports.getUserByUsername = exports.getUserById = exports.addUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importStar(require("./userModel"));
const createUser = () => (0, userModel_1.default)().doc();
const addUser = async (username, password) => {
    const userSnapshot = await (0, userModel_1.default)().where("username", "==", username).get();
    if (!userSnapshot.empty)
        return undefined;
    const user = createUser();
    (0, userModel_1.default)().doc(user.id).set({
        id: user.id,
        username: username,
        hashedPassword: await bcrypt_1.default.hash(password, 10),
        userRight: "DEFAULT",
        vCPU: userModel_1.DEFAULT_VCPU,
        createdAt: Date.now()
    });
    return user.id;
};
exports.addUser = addUser;
const getUserById = async (id) => (await (0, userModel_1.default)().doc(id).get()).data();
exports.getUserById = getUserById;
const getUserByUsername = async (username) => {
    const userSnapshot = await (0, userModel_1.default)().where("username", "==", username).get();
    if (userSnapshot.empty)
        return undefined;
    return userSnapshot.docs[0].data();
};
exports.getUserByUsername = getUserByUsername;
const verifyUserPassword = (password, hashedPassword) => bcrypt_1.default.compare(password, hashedPassword);
exports.verifyUserPassword = verifyUserPassword;
const deleteUserById = (userId) => (0, userModel_1.default)().doc(userId).delete();
exports.deleteUserById = deleteUserById;
//# sourceMappingURL=userService.js.map