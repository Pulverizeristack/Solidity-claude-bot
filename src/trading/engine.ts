import { fetchMarketData } from "../data/market";
import { ClaudeTrader } from "../claude/client";
import { RiskManager } from "./risk";
import { BlockchainExecutor } from "../blockchain/wallet";
import { logger } from "../utils/logger";

export class TradingEngine {
  private claude = new ClaudeTrader();
  private risk = new RiskManager();
  private executor = new BlockchainExecutor();

  /** One full scan cycle: fetch data -> Claude decides -> risk checks -> execute. */
  async runOnce(symbol = "ETHUSDC"): Promise<void> {
    logger.info(`── Scan cycle started for ${symbol} ──`);

    const market = await fetchMarketData(symbol);
    logger.info(
      `Price $${market.price} | 24h ${market.change24hPct.toFixed(2)}% | RSI ${market.rsi14.toFixed(1)} | Vol ${market.volatilityPct.toFixed(2)}%`
    );

    // 1. Hard exit rules fire before any new decision
    const exit = this.risk.checkExit(market.price);
    if (exit) {
      logger.warn(`${exit} triggered — closing position.`);
      const closed = this.risk.close();
      if (closed) await this.executor.executeSwap("SELL", closed.sizeUsd);
      return;
    }

    // 2. Ask Claude for a decision
    const decision = await this.claude.decide(market, this.risk.hasOpenPosition());
    logger.info(`Claude: ${decision.action} (confidence ${decision.confidence}) — ${decision.reasoning}`);

    // 3. Enforce risk limits
    const safe = this.risk.applyLimits(decision);

    // 4. Execute
    if (safe.action === "BUY") {
      const size = this.risk.sizePosition(safe.suggestedSizeUsd);
      const txHash = await this.executor.executeSwap("BUY", size);
      this.risk.open(market.price, size);
      logger.info(`BUY executed ($${size}) — tx: ${txHash}`);
    } else if (safe.action === "SELL" && this.risk.hasOpenPosition()) {
      const closed = this.risk.close();
      if (closed) {
        const txHash = await this.executor.executeSwap("SELL", closed.sizeUsd);
        logger.info(`SELL executed — tx: ${txHash}`);
      }
    } else {
      logger.info("HOLD — no action this cycle.");
    }
  }
}
