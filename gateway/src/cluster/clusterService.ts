import googleEngineClusterManager from "../config/googleEngineClusterManager";

const client = googleEngineClusterManager();

export const getNodeQuantity = async () => {
    const [nodePools] = await client.listNodePools();
    return nodePools.nodePools?.length;
}

export const setNumberOfNodes = async (nodeCount: number) => {
    const [operation] = await client.setNodePoolSize({ nodeCount: nodeCount })
    return operation;
}
