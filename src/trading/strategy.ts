import type { MarketSnapshot } from "../data/market";
import { config } from "../config";

export function buildTradingPrompt(market: MarketSnapshot, openPosition: boolean): string {
  return `Analyze this market snapshot and decide the next action.

PAIR: ${market.pair}
CURRENT PRICE: $${market.price}
24H CHANGE: ${market.change24hPct.toFixed(2)}%
RSI(14): ${market.rsi14.toFixed(1)}
SMA(20): $${market.sma20.toFixed(2)}
VOLATILITY: ${market.volatilityPct.toFixed(2)}%
POSITION OPEN: ${openPosition}
RULES:
- RSI > 70 suggests overbought (lean SELL). RSI < 30 suggests oversold (lean BUY).
- Price above SMA20 = uptrend bias; below = downtrend bias.
- High volatility requires extra caution and lower confidence.
- An open position with take profit or stop loss near should lean SELL/HOLD.
- Minimum confidence to act: ${config.confidenceThreshold}.

Recent 30m OHLCV (oldest -> newest):
${market.bars.map((b) => `${new Date(b.time).toISOString()} O:${b.open} H:${b.high} L:${b.low} C:${b.close} V:${b.volume}`).join("\n")}

Respond with STRICT JSON only:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": <number 0-1>,
  "reasoning": "<2-3 sentences max>",
  "suggestedSizeUsd": <number, optional>
}`;
}
