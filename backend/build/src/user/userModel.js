"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VCPU = void 0;
const googleFirestore_1 = __importDefault(require("../config/googleFirestore"));
exports.DEFAULT_VCPU = 3;
const userConverter = {
    toFirestore(user) {
        return user;
    },
    fromFirestore(snapshot) {
        return snapshot.data();
    }
};
exports.default = () => (0, googleFirestore_1.default)().collection("User").withConverter(userConverter);
//# sourceMappingURL=userModel.js.map