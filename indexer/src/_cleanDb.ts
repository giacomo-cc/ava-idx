import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { startListening } from "./avalanche";
import { ETL_INTERVAL_MS, TRUNCATE_INTERVAL_MS } from "./config";
import { RAW_TX_COLLECTION_NAME, TX_COLLECTION_NAME, WALLETS_COLLECTION_NAME, createDbClient, truncateDb } from "./db";
import { logger } from "./logger";
import { etl } from "./etl";

logger.info("START");

const scheduler = new ToadScheduler();

// DEBUG, remove old tables
createDbClient().then((c) => {
  logger.warn("drop all collections");
  c.dropCollection(RAW_TX_COLLECTION_NAME).catch((e) => {});
  c.dropCollection(TX_COLLECTION_NAME).catch((e) => {});
  c.dropCollection(WALLETS_COLLECTION_NAME).catch((e) => {});
});

/** * * * * * * * * * * * * * * * *
 * Process event handlers
 */

process.on("exit", () => {
  logger.info("...and lived happily ever after");
});
