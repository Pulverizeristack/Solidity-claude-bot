import { config } from "../config";
import type { TradeDecision } from "../claude/client";
import { logger } from "../utils/logger";

export interface Position {
  entryPrice: number;
  sizeUsd: number;
  openedAt: number;
}

export class RiskManager {
  private position: Position | null = null;

  hasOpenPosition(): boolean {
    return this.position !== null;
  }

  getPosition(): Position | null {
    return this.position;
  }

  /** Check stop-loss / take-profit triggers against the current price. */
  checkExit(price: number): "STOP_LOSS" | "TAKE_PROFIT" | null {
    if (!this.position) return null;
    const changePct = ((price - this.position.entryPrice) / this.position.entryPrice) * 100;
    if (changePct <= -config.stopLossPct) return "STOP_LOSS";
    if (changePct >= config.takeProfitPct) return "TAKE_PROFIT";
    return null;
  }

  /** Apply risk limits to a Claude decision. Returns the final action. */
  applyLimits(decision: TradeDecision): TradeDecision {
    if (decision.confidence < config.confidenceThreshold) {
      logger.info(`Confidence ${decision.confidence} below threshold — forcing HOLD.`);
      return { ...decision, action: "HOLD" };
    }
    if (decision.action === "BUY" && this.position) {
      logger.info("Position already open — blocking duplicate BUY.");
      return { ...decision, action: "HOLD" };
    }
    return decision;
  }

  sizePosition(suggested?: number): number {
    const size = suggested ?? config.maxPositionSizeUsd;
    return Math.min(size, config.maxPositionSizeUsd);
  }

  open(entryPrice: number, sizeUsd: number): void {
    this.position = { entryPrice, sizeUsd, openedAt: Date.now() };
  }

  close(): Position | null {
    const pos = this.position;
    this.position = null;
    return pos;
  }
}
