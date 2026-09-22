import "dotenv/config";

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  rpcUrl: process.env.RPC_URL ?? "",
  paperTrading: (process.env.PAPER_TRADING ?? "true") === "true",
  privateKey: process.env.PRIVATE_KEY ?? "",
  baseToken: process.env.BASE_TOKEN ?? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  quoteToken: process.env.QUOTE_TOKEN ?? "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  maxPositionSizeUsd: Number(process.env.MAX_POSITION_SIZE_USD ?? "100"),
  stopLossPct: Number(process.env.STOP_LOSS_PCT ?? "4"),
  takeProfitPct: Number(process.env.TAKE_PROFIT_PCT ?? "6"),
  confidenceThreshold: Number(process.env.CONFIDENCE_THRESHOLD ?? "0.65"),
  scanIntervalMinutes: Number(process.env.SCAN_INTERVAL_MINUTES ?? "30"),
  claudeModel: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514",
} as const;

export function validateConfig(): void {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing. Copy .env.example to .env and fill it in.");
  }
  if (!config.paperTrading && !config.privateKey) {
    throw new Error("PRIVATE_KEY is required when PAPER_TRADING=false");
  }
}
