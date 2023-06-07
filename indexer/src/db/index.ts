import { MongoClient } from "mongodb";
import { MAX_BLOCK_TO_PERSIST } from "../config";
import { logger } from "../logger";

const DB_URL = process.env.DB_URL || "mongodb://root:root@mongo:27017";
const DB_NAME = process.env.DB_NAME || "ava-idx-db";

export const RAW_TX_COLLECTION_NAME = "raw_txs";
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

export async function truncateDb() {
  logger.info("start truncating txs");
  const db = await createDbClient();

  // get top recent block
  const topRecentBlock = await db.collection(TX_COLLECTION_NAME).find().sort({ blockNumber: -1 }).next();
  if (topRecentBlock) {
    const oldestBlock = topRecentBlock["blockNumber"] - MAX_BLOCK_TO_PERSIST;
    logger.trace(`removing txs with block older than ${oldestBlock}`);

    const deleteResult = await db.collection(TX_COLLECTION_NAME).deleteMany({
      blockNumber: { $lt: oldestBlock },
    });
    logger.debug(`removed ${deleteResult.deletedCount} entries`);
  }
}
