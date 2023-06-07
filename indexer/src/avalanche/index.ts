import { Transaction, createPublicClient, formatUnits, http } from "viem";
import { avalanche } from "viem/chains";
import { RAW_TX_COLLECTION_NAME, createDbClient } from "../db";
import { logger } from "../logger";

const AVAX_DECIMALS = 18;

const RPC_URL = "https://api.avax.network/ext/bc/C/rpc";
// const WS_URL = "wss://api.avax.network/ext/bc/C/ws";

const rpcClient = createPublicClient({
  chain: avalanche,
  transport: http(RPC_URL),
});

export async function startListening() {
  const db = await createDbClient();

  rpcClient.watchBlocks({
    includeTransactions: true,
    blockTag: "finalized",
    onBlock: async (b) => {
      const txs = b.transactions as Transaction[];

      logger.info(`received block ${b.number} with ${txs.length} txs`);
      await db.collection(RAW_TX_COLLECTION_NAME).insertMany(txs);
    },
  });
}

export const convertTokenAmountToFloat = (value: bigint) => Number(formatUnits(value, AVAX_DECIMALS));

export async function getWalletBalance(wallet: string) {
  return await rpcClient.getBalance({
    address: wallet as `0x{string}`,
  });
}
