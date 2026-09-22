import { ethers } from "ethers";
import { config } from "../config";
import { logger } from "../utils/logger";

const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) external returns (uint[] amounts)",
];

export class BlockchainExecutor {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private router: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    if (!config.paperTrading && config.privateKey) {
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      this.router = new ethers.Contract(UNISWAP_V2_ROUTER, ROUTER_ABI, this.wallet);
      logger.info(`Live wallet loaded: ${this.wallet.address}`);
    } else {
      logger.info("PAPER_TRADING=true — no real transactions will be sent.");
    }
  }

  async executeSwap(direction: "BUY" | "SELL", amountUsd: number): Promise<string> {
    if (config.paperTrading || !this.router || !this.wallet) {
      logger.info(`[PAPER] ${direction} $${amountUsd.toFixed(2)} — simulated, no tx sent.`);
      return `paper-${Date.now()}`;
    }

    const path =
      direction === "BUY"
        ? [config.quoteToken, config.baseToken]
        : [config.baseToken, config.quoteToken];
    const amountIn = ethers.parseUnits(amountUsd.toFixed(6), 6); // USDC has 6 decimals
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const tx = await this.router.swapExactTokensForTokens(
      amountIn,
      0, // TODO: set a real slippage tolerance in production
      path,
      this.wallet.address,
      deadline
    );
    logger.info(`Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Confirmed in block ${receipt?.blockNumber}`);
    return tx.hash;
  }
}
