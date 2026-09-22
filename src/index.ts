import cron from "node-cron";
import { config, validateConfig } from "./config";
import { TradingEngine } from "./trading/engine";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  validateConfig();
  const engine = new TradingEngine();

  if (process.argv.includes("--once")) {
    await engine.runOnce();
    return;
  }

  logger.info(`Starting Solidity Claude Bot — scanning every ${config.scanIntervalMinutes} minutes.`);
  cron.schedule(`*/${config.scanIntervalMinutes} * * * *`, () => {
    engine.runOnce().catch((err) => logger.error(`Scan cycle failed: ${(err as Error).message}`));
  });

  // Run one cycle immediately so users see instant feedback
  await engine.runOnce();
}

main().catch((err) => {
  logger.error(`Fatal: ${(err as Error).message}`);
  process.exit(1);
});
