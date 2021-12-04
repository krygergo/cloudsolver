import { Router } from "express";
import { getNodeQuantity } from "./clusterService";

const route = Router();

route.get("/NodesQuantity", async (_, res) => {
    const nodesQuantity = await getNodeQuantity();
    res.send(nodesQuantity);
});

export { route }