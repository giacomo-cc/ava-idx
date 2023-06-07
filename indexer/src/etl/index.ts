import _ from "lodash";
import { RAW_TX_COLLECTION_NAME, TX_COLLECTION_NAME, WALLETS_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";
import { Db } from "mongodb";
import { convertTokenAmountToFloat, getWalletBalance } from "../avalanche";

const MAX_LOAD_TXS = 100;

type TransformedTxType = {
  hash: string;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  from: string;
  to: string;
  value: number;
};

export async function etl() {
  logger.info("running etl now");

  /**
   * load and transform txs
   */
  logger.trace(`load raw txs`);

  const db = await createDbClient();
  const cursor = db
    .collection(RAW_TX_COLLECTION_NAME)
    .find()
    .sort({ blockNumber: -1, transactionIndex: -1 })
    .limit(MAX_LOAD_TXS);

  const transformedTxs: TransformedTxType[] = [];
  for await (const rawTxDoc of cursor) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedTx: any = {};

    ["hash", "blockHash", "blockNumber", "from", "to", "transactionIndex"].forEach((k) => {
      transformedTx[k] = rawTxDoc[k];
    });

    transformedTx.value = convertTokenAmountToFloat(BigInt(rawTxDoc["value"]));
    transformedTxs.push(transformedTx);
  }

  if (transformedTxs.length === 0) {
    logger.trace("no tx to transform, exit job");
    return;
  }

  logger.trace(`transformed ${transformedTxs.length} txs`);

  /**
   * save new txs and drop raw
   */

  logger.info(`save ${transformedTxs.length} transformed txs`);
  await db.collection(TX_COLLECTION_NAME).insertMany(transformedTxs);

  logger.debug(`delete ${transformedTxs.length} raw txs`);
  await db.collection(RAW_TX_COLLECTION_NAME).deleteMany({
    hash: { $in: transformedTxs.map((c) => c.hash) },
  });

  /**
   * refresh wallet balances
   */
  const walletsToUpdate = _.flatten(transformedTxs.map((t) => (t.to ? [t.from, t.to] : [t.from])));
  logger.debug(`update ${walletsToUpdate.length} wallets balance`);
  await Promise.allSettled(walletsToUpdate.map(async (wallet) => refreshWalletBalance(db, wallet)));
}

export async function refreshWalletBalance(db: Db, address: string) {
  const walletBalanceBigInt = await getWalletBalance(address);
  const balance = convertTokenAmountToFloat(walletBalanceBigInt);

  // logger.info(`update wallet ${address} balance, new balance: ${balance}`);
  await db.collection(WALLETS_COLLECTION_NAME).findOneAndUpdate(
    {
      wallet: address,
    },
    {
      $set: { wallet: address, balance },
    },
    {
      upsert: true,
    }
  );
}
