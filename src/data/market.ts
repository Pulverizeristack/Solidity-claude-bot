import axios from "axios";

export interface OhlcvBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  pair: string;
  price: number;
  change24hPct: number;
  rsi14: number;
  sma20: number;
  volatilityPct: number;
  bars: OhlcvBar[];
}

const BINANCE_KLINES = "https://api.binance.com/api/v3/klines";
const BINANCE_TICKER = "https://api.binance.com/api/v3/ticker/24hr";

function computeRsi(closes: number[], period = 14): number {
  if (closes.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function computeSma(values: number[], period = 20): number {
  if (values.length < period) return values[values.length - 1] ?? 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** Fetch OHLCV bars for a symbol like "ETHUSDC" from Binance public API. */
export async function fetchMarketData(symbol = "ETHUSDC"): Promise<MarketSnapshot> {
  const [klinesRes, tickerRes] = await Promise.all([
    axios.get(BINANCE_KLINES, { params: { symbol, interval: "30m", limit: 100 } }),
    axios.get(BINANCE_TICKER, { params: { symbol } }),
  ]);

  const bars: OhlcvBar[] = klinesRes.data.map((k: any[]) => ({
    time: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }));

  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);

  const sma20 = computeSma(closes, 20);
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((a, b) => a + (b - mean) ** 2, 0) / closes.length;
  const volatilityPct = (Math.sqrt(variance) / mean) * 100;
  const barHigh = Math.max(...highs);
  const barLow = Math.min(...lows);

  return {
    pair: symbol,
    price: closes[closes.length - 1],
    change24hPct: Number(tickerRes.data.priceChangePercent),
    rsi14: computeRsi(closes),
    sma20,
    volatilityPct,
    bars: bars.slice(-30),
  };
}
