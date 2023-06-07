import { Request, Response } from "express";
import { TX_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";

/**
 * wallet transaction list order by `blockNumber` and `transactionIndex`
 */

export const ROUTE = "/walletTxs";
export async function handler(req: Request, res: Response) {
  try {
    const { w } = req.query;
    if (typeof w !== "string") {
      res.sendStatus(400);
      return;
    }

    logger.info(`fetch wallet ${w} txs`);

    const db = await createDbClient();
    const txCursor = db
      .collection(TX_COLLECTION_NAME)
      .find({
        $or: [{ to: w }, { from: w }],
      })
      .sort({ blockNumber: -1, transactionIndex: -1 });

    const txs = [];
    for await (const a of txCursor) txs.push(a);

    logger.info(`fetched ${txs.length} txs`);
    res.json(txs);
  } catch (e) {
    res.sendStatus(500);
  }
}
