import express, { Express } from "express";
import * as walletTxs from "./routes/walletTxs";
import * as walletTxCount from "./routes/walletTxCount";
import * as txsByValue from "./routes/txsByValue";
import * as topWallets from "./routes/topWallets";
import { logger } from "./logger";

const app: Express = express();
const port = process.env.PORT || 3000;

app.get(walletTxs.ROUTE, walletTxs.handler);
app.get(walletTxCount.ROUTE, walletTxCount.handler);
app.get(txsByValue.ROUTE, txsByValue.handler);
app.get(topWallets.ROUTE, topWallets.handler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
