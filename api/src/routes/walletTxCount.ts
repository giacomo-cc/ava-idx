import { Request, Response } from "express";
import { TX_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";

/**
 * Number of txs sent or received by a wallet
 */
export const ROUTE = "/walletTxCount";
export async function handler(req: Request, res: Response) {
  try {
    const { w } = req.query;
    if (typeof w !== "string") {
      res.sendStatus(400);
      return;
    }

    logger.info(`fetch wallet ${w} txs`);

    const db = await createDbClient();
    const count = await db.collection(TX_COLLECTION_NAME).countDocuments({
      $or: [{ to: w }, { from: w }],
    });

    logger.info(`tx count: ${count}`);
    res.json({ count });
  } catch (e) {
    res.sendStatus(500);
  }
}
