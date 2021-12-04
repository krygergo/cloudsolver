import { Router } from "express";
import { nodeQuantity } from "./clusterService";

const route = Router();

route.get("/nodes", async (req, res) => {
    const quantity = await nodeQuantity();
    res.send(quantity);
});

export { route }