import { Request, Response } from "express";
import { TX_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";

/**
 * retrieve transactions list order by $AVAX value moved, limited to 100 entries
 */

export const ROUTE = "/txsByValue";
export async function handler(req: Request, res: Response) {
  try {
    const db = await createDbClient();
    const txCursor = db.collection(TX_COLLECTION_NAME).find({}).sort({ value: -1 }).limit(100);

    const txs = [];
    for await (const a of txCursor) txs.push(a);

    logger.info(`fetched ${txs.length} txs`);
    res.json(txs);
  } catch (e) {
    res.sendStatus(500);
  }
}
