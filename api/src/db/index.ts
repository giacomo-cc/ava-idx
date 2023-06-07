import { MongoClient } from "mongodb";

const DB_URL = process.env.DB_URL || "mongodb://root:root@mongo:27017";
const DB_NAME = process.env.DB_NAME || "ava-idx-db";

export const TX_COLLECTION_NAME = "txs";
export const WALLETS_COLLECTION_NAME = "wallets";

let dbClient: MongoClient | undefined = undefined;
export async function createDbClient() {
  if (!dbClient) {
    dbClient = new MongoClient(DB_URL);
    await dbClient.connect();
  }
  return dbClient.db(DB_NAME);
}
