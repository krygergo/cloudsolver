import { Storage } from "@google-cloud/storage"
import { env } from "./environment";

const storage = new Storage({
    projectId: "dm885-cloud-solver"
});

export default () => storage;