import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { startListening } from "./avalanche";
import { ETL_INTERVAL_MS, TRUNCATE_INTERVAL_MS } from "./config";
import { RAW_TX_COLLECTION_NAME, TX_COLLECTION_NAME, WALLETS_COLLECTION_NAME, createDbClient, truncateDb } from "./db";
import { logger } from "./logger";
import { etl } from "./etl";

logger.info("START");

const scheduler = new ToadScheduler();

/** * * * * * * * * * * * * * * * *
 * ETL job
 */

{
  const task = new AsyncTask("etl", etl, (e: Error) => {
    console.log(e);
    logger.fatal("error on etl", e);
  });
  const job = new SimpleIntervalJob({ milliseconds: ETL_INTERVAL_MS }, task, { preventOverrun: true });
  scheduler.addSimpleIntervalJob(job);
}

/** * * * * * * * * * * * * * * * *
 * DB truncatoin job
 */

{
  const task = new AsyncTask("db truncation", truncateDb, (e: Error) => {
    logger.fatal("error truncating db", e);
  });
  const job = new SimpleIntervalJob({ milliseconds: TRUNCATE_INTERVAL_MS }, task, { preventOverrun: true });
  scheduler.addSimpleIntervalJob(job);
}

/** * * * * * * * * * * * * * * * *
 * Start listening for chain txs
 */

logger.info("start listening for new ttxs");
startListening();

/** * * * * * * * * * * * * * * * *
 * Process event handlers
 */

process.on("exit", () => {
  // stop scheduler
  scheduler.stop();

  logger.info("...and lived happily ever after");
});
