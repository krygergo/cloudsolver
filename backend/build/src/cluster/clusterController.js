"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const clusterService_1 = require("./clusterService");
const route = (0, express_1.Router)();
exports.route = route;
route.get("/nodes", async (req, res) => {
    const quantity = await (0, clusterService_1.nodeQuantity)();
    res.send(quantity);
});
//# sourceMappingURL=clusterController.js.map