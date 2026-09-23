import { dev } from '$app/environment';
import { chains, geckoNetworkFor, resolveAppChainKey } from '$lib/utils/chains';
import {
	chartIntervals,
	GECKO_CANDLE_CAP,
	GECKO_INTERVAL_UNAVAILABLE,
	GECKO_MAX_CANDLES,
	isIntervalKey,
	type IntervalKey
} from '$lib/utils/common';
import { finiteNumber, parseTimestamp, type Candle } from '$lib/utils/candles';
import type { SearchHit, SearchPayload } from '$lib/utils/searchResults';

const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';
const GECKO_ACCEPT = 'application/json;version=20230203';
const CACHE_TTL_MS = 60_000;
const NETWORK_TTL_MS = 60 * 60 * 1000;

const GECKO_SLUGS = new Set(Object.values(chains).map((chain) => chain.geckoNetwork));
export const GECKO_SEARCH_RATE_LIMIT = 'Gecko Terminal rate limit. Wait and try again.';

type CacheEntry = { at: number; candles: Candle[] };

const ohlcvCache = new Map<string, CacheEntry>();
let networkCache: { at: number; slugs: Set<string> } | null = null;

export type GeckoCandleResult =
	| { candles: Candle[]; warning?: string }
	| { error: string; status: number };

export function knownGeckoSlugList(): string[] {
	return [...GECKO_SLUGS].sort();
}

function unknownNetwork(chain: string | undefined): { error: string; status: number } {
	const label = chain && chain.trim() ? chain.trim() : '(empty)';
	return {
		error: `Unknown network "${label}". Known slugs: ${knownGeckoSlugList().join(', ')}.`,
		status: 400
	};
}

function staticGeckoNetwork(chain: string | undefined): string | null {
	const key = (chain ?? 'eth').trim();
	if (!key) return 'eth';
	const mapped = geckoNetworkFor(key);
	if (mapped) return mapped === 'pulse' ? 'pulsechain' : mapped;
	if (key.toLowerCase() === 'pulse') return 'pulsechain';
	if (GECKO_SLUGS.has(key.toLowerCase())) return key.toLowerCase();
	return null;
}

async function geckoFetch(path: string): Promise<Response> {
	return fetch(`${GECKO_BASE}${path}`, {
		method: 'GET',
		headers: {
			Accept: GECKO_ACCEPT
		}
	});
}

async function loadNetworkSlugs(): Promise<Set<string> | { error: string; status: number }> {
	if (networkCache && Date.now() - networkCache.at < NETWORK_TTL_MS) {
		return networkCache.slugs;
	}
	const slugs = new Set<string>(GECKO_SLUGS);
	for (let page = 1; page <= 3; page += 1) {
		const response = await geckoFetch(`/networks?page=${page}`);
		if (response.status === 429) {
			return {
				error: 'Gecko Terminal rate limit reached. Try again in a minute.',
				status: 429
			};
		}
		if (!response.ok) {
			if (networkCache) return networkCache.slugs;
			return {
				error: 'Could not load the Gecko Terminal network list.',
				status: 502
			};
		}
		const body = (await response.json()) as {
			data?: Array<{ id?: string }>;
			links?: { next?: string | null };
		};
		for (const item of body.data ?? []) {
			if (item?.id) slugs.add(item.id);
		}
		if (!body.links?.next) break;
	}
	networkCache = { at: Date.now(), slugs };
	return slugs;
}

async function resolveNetwork(
	chain: string | undefined
): Promise<{ network: string } | { error: string; status: number }> {
	const direct = staticGeckoNetwork(chain);
	if (direct) return { network: direct };
	const raw = (chain ?? '').trim().toLowerCase();
	if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(raw)) {
		return unknownNetwork(chain);
	}
	const listed = await loadNetworkSlugs();
	if (listed instanceof Set) {
		if (listed.has(raw)) return { network: raw };
		return unknownNetwork(chain);
	}
	return listed;
}

function normalizePoolAddress(address: string): string {
	const trimmed = address.trim();
	if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) return trimmed.toLowerCase();
	return trimmed;
}

function geckoCurrency(currency: string | undefined): 'usd' | 'token' | null {
	if (!currency || currency === 'usd') return 'usd';
	if (currency === 'native' || currency === 'token') return 'token';
	return null;
}

function readCache(key: string): Candle[] | undefined {
	const hit = ohlcvCache.get(key);
	if (!hit) return undefined;
	if (Date.now() - hit.at > CACHE_TTL_MS) {
		ohlcvCache.delete(key);
		return undefined;
	}
	return hit.candles;
}

function writeCache(key: string, candles: Candle[]) {
	if (ohlcvCache.size > 30) {
		const oldest = ohlcvCache.keys().next().value;
		if (oldest) ohlcvCache.delete(oldest);
	}
	ohlcvCache.set(key, { at: Date.now(), candles });
}

function normalizeRows(rows: unknown): Candle[] {
	if (!Array.isArray(rows)) return [];
	const candles: Candle[] = [];
	for (const row of rows) {
		if (!Array.isArray(row) || row.length < 5) continue;
		const timestamp = parseTimestamp(row[0]);
		const open = finiteNumber(row[1]);
		const high = finiteNumber(row[2]);
		const low = finiteNumber(row[3]);
		const close = finiteNumber(row[4]);
		if (![timestamp, open, high, low, close].every(Number.isFinite)) continue;
		const volume = finiteNumber(row[5]);
		candles.push({
			timestamp,
			open,
			high,
			low,
			close,
			...(Number.isFinite(volume) ? { volume } : {})
		});
	}
	candles.sort((a, b) => a.timestamp - b.timestamp);
	return candles;
}

const MAX_OHLCV_PAGES = 5;

function clampCandleLimit(needed: number): number {
	return Math.min(1000, Math.max(1, Math.ceil(needed)));
}

async function loadOhlcvPage(
	network: string,
	poolAddress: string,
	timeframe: string,
	aggregate: number,
	beforeTimestamp: number,
	limit: number,
	priceCurrency: 'usd' | 'token'
): Promise<{ candles: Candle[] } | { error: string; status: number }> {
	const params = new URLSearchParams({
		aggregate: String(aggregate),
		before_timestamp: String(beforeTimestamp),
		limit: String(limit),
		currency: priceCurrency
	});
	const path = `/networks/${encodeURIComponent(network)}/pools/${encodeURIComponent(poolAddress)}/ohlcv/${timeframe}?${params}`;
	const cached = readCache(path);
	if (cached) return { candles: cached };

	if (dev) console.log(`Gecko OHLCV ${GECKO_BASE}${path}`);

	let response: Response;
	try {
		response = await geckoFetch(path);
	} catch {
		console.error('Gecko Terminal request failed');
		return { error: 'Failed to reach Gecko Terminal.', status: 502 };
	}

	if (response.status === 429) {
		return {
			error: 'Gecko Terminal rate limit reached. Try again in a minute.',
			status: 429
		};
	}
	if (response.status === 400) {
		return { error: GECKO_INTERVAL_UNAVAILABLE, status: 400 };
	}
	if (response.status === 404) {
		return {
			error: 'The pool is not on Gecko Terminal for that network.',
			status: 404
		};
	}
	if (!response.ok) {
		return {
			error: 'Gecko Terminal could not return chart data.',
			status: response.status >= 500 ? 502 : response.status
		};
	}

	const body = (await response.json()) as {
		data?: { attributes?: { ohlcv_list?: unknown } };
	};
	const candles = normalizeRows(body.data?.attributes?.ohlcv_list);
	writeCache(path, candles);
	return { candles };
}

export async function getGeckoCandles(
	address: string,
	chain: string | undefined,
	startMs: number | undefined,
	endMs: number | undefined,
	interval: string | undefined,
	currency: string | undefined
): Promise<GeckoCandleResult> {
	if (!address || !address.trim()) {
		return { error: 'Pair address is required', status: 400 };
	}
	if (!isIntervalKey(interval ?? '1h')) {
		return { error: `Unknown interval "${interval ?? ''}".`, status: 400 };
	}
	const intervalKey = (interval ?? '1h') as IntervalKey;
	const spec = chartIntervals[intervalKey];
	const mapped = spec.gecko;
	if (!mapped || spec.intervalMs == null) {
		return { error: GECKO_INTERVAL_UNAVAILABLE, status: 400 };
	}
	const priceCurrency = geckoCurrency(currency);
	if (!priceCurrency) {
		return { error: 'Currency must be usd or native.', status: 400 };
	}
	const networkResult = await resolveNetwork(chain);
	if ('error' in networkResult) return networkResult;

	const resolvedEnd = Number.isFinite(endMs) ? (endMs as number) : Date.now();
	const resolvedStart = Number.isFinite(startMs)
		? (startMs as number)
		: resolvedEnd - 24 * 60 * 60 * 1000;
	if (!Number.isFinite(resolvedStart) || !Number.isFinite(resolvedEnd)) {
		return { error: 'Start or end is not a valid date.', status: 400 };
	}
	if (resolvedStart >= resolvedEnd) {
		return { error: 'End must be after Start.', status: 400 };
	}

	const needed = Math.max(1, Math.ceil((resolvedEnd - resolvedStart) / spec.intervalMs));
	if (needed > GECKO_MAX_CANDLES) {
		return { error: GECKO_CANDLE_CAP, status: 400 };
	}
	let before = Math.floor(resolvedEnd / 1000);
	if (!Number.isSafeInteger(before) || before <= 0 || String(before).length > 10) {
		return { error: 'Start or end is not a valid date.', status: 400 };
	}

	const poolAddress = normalizePoolAddress(address);
	const merged = new Map<number, Candle>();
	const maxPages = Math.min(MAX_OHLCV_PAGES, Math.max(1, Math.ceil(needed / 1000)));
	let hitPageCap = false;

	for (let page = 0; page < maxPages; page += 1) {
		const pageLimit = page === 0 ? clampCandleLimit(needed) : 1000;
		const batch = await loadOhlcvPage(
			networkResult.network,
			poolAddress,
			mapped.timeframe,
			mapped.aggregate,
			before,
			pageLimit,
			priceCurrency
		);
		if ('error' in batch) {
			if (batch.status === 404 && networkResult.network === 'pulse' && page === 0) {
				return getGeckoCandles(address, 'pulsechain', startMs, endMs, interval, currency);
			}
			return batch;
		}

		const fresh = batch.candles.filter((candle) => !merged.has(candle.timestamp));
		for (const candle of fresh) merged.set(candle.timestamp, candle);
		if (batch.candles.length < pageLimit || fresh.length === 0) break;

		const oldest = batch.candles.reduce((min, candle) => Math.min(min, candle.timestamp), Infinity);
		if (oldest <= resolvedStart) break;

		const nextBefore = Math.floor(oldest / 1000);
		if (nextBefore >= before) break;
		before = nextBefore;
		if (page === maxPages - 1) hitPageCap = true;
	}

	const candles = [...merged.values()]
		.filter((candle) => candle.timestamp >= resolvedStart && candle.timestamp <= resolvedEnd)
		.sort((a, b) => a.timestamp - b.timestamp);
	if (needed > 1000 && hitPageCap) {
		return { candles, warning: GECKO_CANDLE_CAP };
	}
	return { candles };
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

type GeckoResource = {
	id?: string;
	attributes?: {
		address?: string;
		name?: string;
		symbol?: string;
		base_token_price_usd?: string | null;
		price_usd?: string | null;
	};
	relationships?: {
		base_token?: { data?: { id?: string } | null };
		quote_token?: { data?: { id?: string } | null };
	};
};

type GeckoCollection = {
	data?: GeckoResource | GeckoResource[];
	included?: GeckoResource[];
};

function looksLikeAddress(query: string): boolean {
	return EVM_ADDRESS.test(query) || BASE58_ADDRESS.test(query);
}

function includedToken(
	collection: GeckoCollection,
	id: string | undefined
): GeckoResource | undefined {
	if (!id) return undefined;
	return (collection.included ?? []).find((item) => item.id === id);
}

function pushHit(hits: SearchHit[], seen: Set<string>, hit: SearchHit | null) {
	if (!hit) return;
	const address = (hit.type === 'pair' ? hit.pairAddress : hit.tokenAddress)?.toLowerCase();
	if (!address) return;
	const key = `${hit.type}:${address}`;
	if (seen.has(key)) return;
	seen.add(key);
	hits.push(hit);
}

function tokenHit(resource: GeckoResource, chainKey: string): SearchHit | null {
	const address = resource.attributes?.address;
	if (!address) return null;
	return {
		type: 'token',
		name: resource.attributes?.name || 'Unknown token',
		symbol: resource.attributes?.symbol || '',
		tokenAddress: address,
		chainKey,
		chainId: chainKey,
		priceUsd: resource.attributes?.price_usd ?? null,
		verified: null,
		securityScore: null
	};
}

function poolHit(
	pool: GeckoResource,
	collection: GeckoCollection,
	chainKey: string
): SearchHit | null {
	const pairAddress = pool.attributes?.address;
	if (!pairAddress) return null;
	const base = includedToken(collection, pool.relationships?.base_token?.data?.id);
	return {
		type: 'pair',
		name: pool.attributes?.name || base?.attributes?.name || 'Unknown pool',
		symbol: base?.attributes?.symbol || '',
		tokenAddress: base?.attributes?.address,
		pairAddress,
		chainKey,
		chainId: chainKey,
		priceUsd: pool.attributes?.base_token_price_usd ?? base?.attributes?.price_usd ?? null,
		verified: null,
		securityScore: null
	};
}

async function readGecko(
	path: string
): Promise<GeckoCollection | { error: string; status: number }> {
	let response: Response;
	try {
		response = await geckoFetch(path);
	} catch {
		console.error('Gecko Terminal request failed');
		return { error: 'Failed to reach Gecko Terminal.', status: 502 };
	}
	if (response.status === 429) {
		return { error: GECKO_SEARCH_RATE_LIMIT, status: 429 };
	}
	if (response.status === 404) {
		return { data: [] };
	}
	if (!response.ok) {
		return {
			error: 'Gecko Terminal could not search that network.',
			status: response.status >= 500 ? 502 : response.status
		};
	}
	return (await response.json()) as GeckoCollection;
}

export async function searchGecko(
	query: string,
	chain: string | undefined
): Promise<SearchPayload | { error: string; status: number }> {
	const trimmed = query.trim();
	if (!trimmed) return { error: 'Search term is required', status: 400 };
	const chainKey = resolveAppChainKey(chain) ?? (chain ? undefined : 'eth');
	if (!chainKey) return unknownNetwork(chain);
	let network = chains[chainKey].geckoNetwork;
	if (network === 'pulse') network = 'pulsechain';

	const hits: SearchHit[] = [];
	const seen = new Set<string>();

	if (looksLikeAddress(trimmed)) {
		const address = EVM_ADDRESS.test(trimmed) ? trimmed.toLowerCase() : trimmed;
		const token = await readGecko(
			`/networks/${encodeURIComponent(network)}/tokens/${encodeURIComponent(address)}`
		);
		if ('error' in token) return token;
		const tokenData = Array.isArray(token.data) ? token.data[0] : token.data;
		pushHit(hits, seen, tokenData ? tokenHit(tokenData, chainKey) : null);

		const pools = await readGecko(
			`/networks/${encodeURIComponent(network)}/tokens/${encodeURIComponent(address)}/pools?page=1&include=base_token`
		);
		if ('error' in pools) return pools;
		for (const pool of Array.isArray(pools.data) ? pools.data : []) {
			pushHit(hits, seen, poolHit(pool, pools, chainKey));
		}
	}

	const params = new URLSearchParams({
		query: trimmed,
		network,
		page: '1',
		include: 'base_token,quote_token'
	});
	const pools = await readGecko(`/search/pools?${params}`);
	if ('error' in pools && hits.length === 0) return pools;
	if (!('error' in pools)) {
		for (const pool of Array.isArray(pools.data) ? pools.data : []) {
			pushHit(hits, seen, poolHit(pool, pools, chainKey));
		}
	}

	const result = hits.slice(0, 20);
	return { source: 'gecko', total: result.length, result };
}

function networkForChain(
	chain: string | undefined
): { chainKey: string; network: string } | { error: string; status: number } {
	const chainKey = resolveAppChainKey(chain);
	if (!chainKey) return unknownNetwork(chain);
	let network = chains[chainKey].geckoNetwork;
	if (network === 'pulse') network = 'pulsechain';
	return { chainKey, network };
}

export async function listGeckoTokenPools(address: string, chain: string | undefined) {
	const trimmed = address.trim();
	if (!trimmed) return { error: 'Token address is required', status: 400 };
	const resolved = networkForChain(chain);
	if ('error' in resolved) return resolved;
	const poolAddress = EVM_ADDRESS.test(trimmed) ? trimmed.toLowerCase() : trimmed;
	const pools = await readGecko(
		`/networks/${encodeURIComponent(resolved.network)}/tokens/${encodeURIComponent(poolAddress)}/pools?page=1&include=base_token,quote_token`
	);
	if ('error' in pools) return pools;
	const rows = Array.isArray(pools.data) ? pools.data : [];
	const mapped = rows.flatMap((pool) => {
		const hit = poolHit(pool, pools, resolved.chainKey);
		if (!hit?.pairAddress) return [];
		const quote = includedToken(pools, pool.relationships?.quote_token?.data?.id);
		const attributes = pool.attributes as
			| {
					price_change_percentage?: { h24?: string | number };
					volume_usd?: { h24?: string | number };
					reserve_in_usd?: string | number;
			  }
			| undefined;
		const price = Number(hit.priceUsd);
		const change = Number(attributes?.price_change_percentage?.h24);
		const volume = Number(attributes?.volume_usd?.h24);
		const liquidity = Number(attributes?.reserve_in_usd);
		return [
			{
				pair_address: hit.pairAddress,
				pair_label: hit.name,
				exchange_name: 'Gecko Terminal',
				usd_price: Number.isFinite(price) ? price : null,
				usd_price_24hr_percent_change: Number.isFinite(change) ? change : null,
				liquidity_usd: Number.isFinite(liquidity) ? liquidity : null,
				volume_24h_usd: Number.isFinite(volume) ? volume : null,
				inactive_pair: false,
				pair: [
					{
						pair_token_type: 'token0',
						token_name: hit.name,
						token_symbol: hit.symbol
					},
					{
						pair_token_type: 'token1',
						token_name: quote?.attributes?.name || 'Quote',
						token_symbol: quote?.attributes?.symbol || ''
					}
				]
			}
		];
	});
	return { page_size: mapped.length, pairs: mapped };
}
