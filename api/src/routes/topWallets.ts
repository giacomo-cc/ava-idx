import { Request, Response } from "express";
import { WALLETS_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";

/**
 * retrieve top 100 wallets by balance
 */

export const ROUTE = "/topWallets";
export async function handler(req: Request, res: Response) {
  try {
    const db = await createDbClient();
    const cc = db.collection(WALLETS_COLLECTION_NAME).find({}).sort({ balance: -1 }).limit(100);

    const wallets = [];
    for await (const a of cc) wallets.push(a);

    logger.info(`fetched ${wallets.length} wallets`);
    res.json(wallets);
  } catch (e) {
    res.sendStatus(500);
  }
}
