"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleFirestore_1 = __importDefault(require("../config/googleFirestore"));
const sessionConverter = {
    toFirestore(userSession) {
        return {
            data: userSession.data
        };
    },
    fromFirestore(snapshot) {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            data: data.data
        };
    }
};
exports.default = () => (0, googleFirestore_1.default)().collection("Session").withConverter(sessionConverter);
//# sourceMappingURL=sessionModel.js.map