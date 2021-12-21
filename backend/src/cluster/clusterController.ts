import { Router } from "express";
import { nodeQuantity } from "./clusterService";

const route = Router();

/** 
 * Endpoint for getting amount of node pools.
 */
route.get("/nodes", async (req, res) => {
    const quantity = await nodeQuantity();
    res.send(quantity);
});

export default route;