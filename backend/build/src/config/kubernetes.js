"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_node_1 = require("@kubernetes/client-node");
const config = new client_node_1.KubeConfig();
config.loadFromCluster();
exports.default = () => config;
//# sourceMappingURL=kubernetes.js.map