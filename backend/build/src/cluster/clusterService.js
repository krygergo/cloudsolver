"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNumberOfNodes = exports.nodeQuantity = void 0;
const googleEngineClusterManager_1 = __importDefault(require("../config/googleEngineClusterManager"));
const client = (0, googleEngineClusterManager_1.default)();
const nodeQuantity = async () => {
    const [nodePools] = await client.listNodePools();
    return nodePools.nodePools?.length;
};
exports.nodeQuantity = nodeQuantity;
const setNumberOfNodes = async (nodeCount) => {
    const [operation] = await client.setNodePoolSize({ nodeCount: nodeCount });
    return operation;
};
exports.setNumberOfNodes = setNumberOfNodes;
//# sourceMappingURL=clusterService.js.map