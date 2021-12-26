import googleEngineClusterManager from "../config/googleEngineClusterManager";

const client = googleEngineClusterManager();

export const nodeQuantity = async () => {
    const [nodePools] = await client.listNodePools({});
    console.log(nodePools)
    return nodePools.nodePools?.length;
}

export const setNumberOfNodes = async (nodeCount: number) => {
    const [operation] = await client.setNodePoolSize({ nodeCount: nodeCount })
    return operation;
}
