import { Storage } from "@google-cloud/storage"
import { env } from "./environment";

const storage = new Storage();

export default () => storage;