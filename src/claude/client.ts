import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import { logger } from "../utils/logger";
import type { MarketSnapshot } from "../data/market";
import { buildTradingPrompt } from "../trading/strategy";

export interface TradeDecision {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  suggestedSizeUsd?: number;
}

export class ClaudeTrader {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: config.anthropicApiKey });
  }

  async decide(market: MarketSnapshot, openPosition: boolean): Promise<TradeDecision> {
    const response = await this.client.messages.create({
      model: config.claudeModel,
      max_tokens: 1024,
      system:
        "You are the decision engine of a disciplined crypto trading bot. " +
        "You never chase pumps, you respect stop losses, and you always respond " +
        "with strict JSON only — no prose, no markdown fences.",
      messages: [{ role: "user", content: buildTradingPrompt(market, openPosition) }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return this.parseDecision(text);
  }

  private parseDecision(raw: string): TradeDecision {
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        action: ["BUY", "SELL", "HOLD"].includes(parsed.action) ? parsed.action : "HOLD",
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
        reasoning: String(parsed.reasoning ?? "No reasoning provided."),
        suggestedSizeUsd: parsed.suggestedSizeUsd ? Number(parsed.suggestedSizeUsd) : undefined,
      };
    } catch (err) {
      logger.warn(`Failed to parse Claude output, defaulting to HOLD: ${(err as Error).message}`);
      return { action: "HOLD", confidence: 0, reasoning: "Unparseable model output." };
    }
  }
}
