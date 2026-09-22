# Architecture

```
src/
├── index.ts               # Entry point: cron scheduler + first scan
├── config.ts              # Env-driven config + validation
├── claude/
│   └── client.ts          # Anthropic SDK wrapper — sends prompt, parses strict JSON
├── data/
│   └── market.ts          # Binance OHLCV fetch + RSI / SMA / volatility math
├── trading/
│   ├── strategy.ts        # Prompt builder (market snapshot -> Claude instructions)
│   ├── risk.ts            # Position sizing, stop-loss, take-profit, confidence gate
│   └── engine.ts          # Orchestrates one full scan cycle
├── blockchain/
│   └── wallet.ts          # ethers.js wallet + Uniswap V2 swap executor (paper/live)
└── utils/
    └── logger.ts          # winston logger
```

## Design principles

1. **Claude decides, code executes.** Claude never holds keys or signs transactions.
2. **Risk layer can always veto.** Confidence thresholds, position caps and stop-losses
   are enforced in deterministic TypeScript, not by the model.
3. **Paper trading first.** Live execution requires explicitly setting `PAPER_TRADING=false`.
