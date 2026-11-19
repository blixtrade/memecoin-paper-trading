/**
 * Token symbol lookup. Kept dependency-free and free of CLI side effects so it
 * can be tested offline. A failed lookup is reported as `null` rather than a
 * fake symbol — callers must decide the fallback, so a bad lookup can never
 * overwrite a symbol we already know.
 */
import { short } from "./core.js";

/** Look up a token's symbol on DexScreener. Returns null on any failure. */
export async function symbolOf(mint, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(`https://api.dexscreener.com/tokens/v1/solana/${mint}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const pairs = await res.json();
    return pairs?.[0]?.baseToken?.symbol || null;
  } catch {
    return null;
  }
}

/** Choose the symbol to record on a buy: fresh result > existing > short mint. */
export function resolveSymbol(fresh, existing, mint) {
  return fresh || existing || short(mint);
}
