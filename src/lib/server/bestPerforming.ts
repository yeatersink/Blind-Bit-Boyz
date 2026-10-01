import { readGeckoDocument, GECKO_SEARCH_RATE_LIMIT } from '$lib/server/gecko';
import { geckoNetworkFor, resolveAppChainKey } from '$lib/utils/chains';

export const BEST_LIQUIDITY_FLOOR_USD = 1000;
const CACHE_MS = 15_000;
const LIST_ERROR = 'The best performing list could not be loaded.';

export type BestPerformingRow = {
	id: string;
	rank: number;
	name: string;
	symbol: string;
	quote_symbol: string;
	price_change_pct: number;
	price_usd: string;
	liquidity_usd: string;
};

export type BestPerformingResult =
	| { rows: BestPerformingRow[] }
	| { error: string; status: number };

type TokenResource = {
	id?: string;
	attributes?: {
		name?: string;
		symbol?: string;
	};
};

type PoolResource = {
	attributes?: {
		address?: string;
		name?: string;
		base_token_price_usd?: string | number | null;
		price_change_percentage?: { h24?: string | number | null };
		reserve_in_usd?: string | number | null;
	};
	relationships?: {
		base_token?: { data?: { id?: string } | null };
		quote_token?: { data?: { id?: string } | null };
	};
};

type PoolDocument = {
	data?: PoolResource[];
	included?: TokenResource[];
};

type Candidate = {
	id: string;
	name: string;
	symbol: string;
	quote_symbol: string;
	price_change_pct: number;
	price_usd: string;
	liquidity_usd: string;
};

const cache = new Map<string, { at: number; rows: BestPerformingRow[] }>();
const inflight = new Map<string, Promise<BestPerformingResult>>();

function finiteNumber(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	if (typeof value === 'string' && value.trim() === '') return null;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}

function networkSlug(chainId: string): string | { error: string; status: number } {
	const key = resolveAppChainKey(chainId);
	if (!key) return { error: 'That chain is not available for this list.', status: 400 };
	const network = geckoNetworkFor(key);
	if (!network) return { error: 'That chain is not available for this list.', status: 400 };
	return network === 'pulse' ? 'pulsechain' : network;
}

function includedToken(document: PoolDocument, id: string | undefined): TokenResource | undefined {
	if (!id) return undefined;
	return (document.included ?? []).find((item) => item.id === id);
}

function candidatesFrom(body: unknown): Candidate[] {
	if (!body || typeof body !== 'object') return [];
	const document = body as PoolDocument;
	const pools = Array.isArray(document.data) ? document.data : [];
	const rows: Candidate[] = [];
	for (const pool of pools) {
		const address = pool.attributes?.address?.trim() ?? '';
		if (!address) continue;
		const liquidity = finiteNumber(pool.attributes?.reserve_in_usd);
		const change = finiteNumber(pool.attributes?.price_change_percentage?.h24);
		if (liquidity === null || liquidity < BEST_LIQUIDITY_FLOOR_USD || change === null) continue;
		const base = includedToken(document, pool.relationships?.base_token?.data?.id);
		const quote = includedToken(document, pool.relationships?.quote_token?.data?.id);
		const symbol = base?.attributes?.symbol?.trim() || '';
		const name = base?.attributes?.name?.trim() || pool.attributes?.name?.trim() || symbol;
		if (!name && !symbol) continue;
		const price = finiteNumber(pool.attributes?.base_token_price_usd);
		rows.push({
			id: address.toLowerCase(),
			name: name || symbol,
			symbol: symbol || name,
			quote_symbol: quote?.attributes?.symbol?.trim() || '',
			price_change_pct: change,
			price_usd: price === null ? '' : String(price),
			liquidity_usd: String(liquidity)
		});
	}
	return rows;
}

/** Highest 24-hour price change first. Ties keep the earlier pool. Not A to Z. */
export function rankBestPools(candidates: Candidate[]): BestPerformingRow[] {
	const byPool = new Map<string, Candidate>();
	for (const candidate of candidates) {
		const existing = byPool.get(candidate.id);
		if (!existing || candidate.price_change_pct > existing.price_change_pct) {
			byPool.set(candidate.id, candidate);
		}
	}
	return [...byPool.values()]
		.sort((left, right) => right.price_change_pct - left.price_change_pct)
		.slice(0, 10)
		.map((row, index) => ({
			id: row.id,
			rank: index + 1,
			name: row.name,
			symbol: row.symbol,
			quote_symbol: row.quote_symbol,
			price_change_pct: row.price_change_pct,
			price_usd: row.price_usd,
			liquidity_usd: row.liquidity_usd
		}));
}

async function loadNetwork(network: string): Promise<BestPerformingResult> {
	const trendingPath = `/networks/${encodeURIComponent(network)}/trending_pools?include=base_token,quote_token&duration=24h`;
	const volumePath = `/networks/${encodeURIComponent(network)}/pools?include=base_token,quote_token&page=1&sort=h24_volume_usd_desc`;
	const [trending, volume] = await Promise.all([
		readGeckoDocument(trendingPath),
		readGeckoDocument(volumePath)
	]);
	const candidates: Candidate[] = [];
	const failures: { error: string; status: number }[] = [];
	let loaded = 0;
	if ('error' in trending) failures.push(trending);
	else {
		loaded += 1;
		candidates.push(...candidatesFrom(trending.body));
	}
	if ('error' in volume) failures.push(volume);
	else {
		loaded += 1;
		candidates.push(...candidatesFrom(volume.body));
	}
	if (loaded === 0) {
		if (failures.some((failure) => failure.status === 429)) {
			return { error: GECKO_SEARCH_RATE_LIMIT, status: 429 };
		}
		return { error: LIST_ERROR, status: 502 };
	}
	const rows = rankBestPools(candidates);
	cache.set(network, { at: Date.now(), rows });
	return { rows };
}

export async function bestPerforming(chainId: string): Promise<BestPerformingResult> {
	const network = networkSlug(chainId);
	if (typeof network !== 'string') return network;
	const cached = cache.get(network);
	if (cached && Date.now() - cached.at < CACHE_MS) return { rows: cached.rows };
	const pending = inflight.get(network);
	if (pending) return pending;
	const job = loadNetwork(network).finally(() => {
		inflight.delete(network);
	});
	inflight.set(network, job);
	return job;
}
