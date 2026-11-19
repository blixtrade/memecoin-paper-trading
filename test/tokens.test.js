import test from "node:test";
import assert from "node:assert/strict";
import { symbolOf, resolveSymbol } from "../lib/tokens.js";
import { short } from "../lib/core.js";

const MINT = "9hjBq8nV2mXxYyZzKkLmNnPpQqRrSsTtUuVvWwXxYyZzpump";

const fakeFetch = (response) => async () => response;
const jsonResponse = (body, ok = true, status = ok ? 200 : 429) => ({ ok, status, json: async () => body });

test("symbolOf returns the real symbol on a successful lookup", async () => {
  const fetchImpl = fakeFetch(jsonResponse([{ baseToken: { symbol: "DCTY" } }]));
  assert.equal(await symbolOf(MINT, fetchImpl), "DCTY");
});

test("symbolOf returns null on a non-ok response such as a 429 rate limit", async () => {
  const fetchImpl = fakeFetch(jsonResponse({}, false, 429));
  assert.equal(await symbolOf(MINT, fetchImpl), null);
});

test("symbolOf returns null when the request throws", async () => {
  const fetchImpl = async () => { throw new Error("network down"); };
  assert.equal(await symbolOf(MINT, fetchImpl), null);
});

test("symbolOf returns null when DexScreener has no pairs", async () => {
  const fetchImpl = fakeFetch(jsonResponse([]));
  assert.equal(await symbolOf(MINT, fetchImpl), null);
});

test("resolveSymbol prefers a fresh lookup result", () => {
  assert.equal(resolveSymbol("DCTY", "OLD", MINT), "DCTY");
});

test("resolveSymbol keeps an existing position symbol when the lookup failed", () => {
  assert.equal(resolveSymbol(null, "DCTY", MINT), "DCTY");
});

test("resolveSymbol falls back to the short mint for a brand-new position", () => {
  assert.equal(resolveSymbol(null, undefined, MINT), short(MINT));
});
