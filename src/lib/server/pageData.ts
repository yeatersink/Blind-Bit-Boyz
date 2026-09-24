import { readGeckoDocument } from '$lib/server/gecko';
import { getPairData, getTokenData, getTokenPairs, isApiError } from '$lib/server/tokens';
import { chainLabel, geckoNetworkFor, resolveAppChainKey } from '$lib/utils/chains';
import {
	ageText,
	displayValue,
	saneNumber,
	usdText,
	type OverviewPool,
	type OverviewRow,
	type PageOverview
} from '$lib/utils/overview';
import type { DataSource } from '$lib/utils/searchResults';

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	return value as RecordValue;
}

function text(record: RecordValue | null, ...keys: string[]): string {
	if (!record) return '';
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
		if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	}
	return '';
}

function nested(record: RecordValue | null, key: string): RecordValue | null {
	return record ? asRecord(record[key]) : null;
}

function includedField(body: RecordValue | null, id: string | undefined, key: string): string {
	if (!body || !id) return '';
	const included = Array.isArray(body.included) ? body.included : [];
	for (const item of included) {
		const record = asRecord(item);
		if (!record || record.id !== id) continue;
		return text(asRecord(record.attributes), key);
	}
	return '';
}

function includedName(body: RecordValue | null, id: string | undefined): string {
	return includedField(body, id, 'name');
}

function includedTokenAddress(body: RecordValue | null, id: string | undefined): string {
	if (!body || !id) return '';
	const included = Array.isArray(body.included) ? body.included : [];
	for (const item of included) {
		const record = asRecord(item);
		if (!record || record.id !== id) continue;
		return text(asRecord(record.attributes), 'address');
	}
	return '';
}

function relationshipId(record: RecordValue | null, name: string): string {
	const relationships = nested(record, 'relationships');
	const relation = nested(relationships, name);
	const data = asRecord(relation?.data);
	return text(data, 'id');
}

function row(label: string, value: unknown): OverviewRow {
	return { label, value: displayValue(value) };
}

function volumeRows(volume: RecordValue | null, prefix: string): OverviewRow[] {
	if (!volume) return [];
	const order = ['m5', 'm15', 'm30', 'h1', 'h6', 'h24', '1h', '24h', '1d', '1w'];
	const rows: OverviewRow[] = [];
	for (const key of order) {
		if (!(key in volume)) continue;
		rows.push(row(`${prefix} (${key})`, usdText(volume[key])));
	}
	for (const [key, value] of Object.entries(volume)) {
		if (order.includes(key)) continue;
		if (typeof value === 'number' || typeof value === 'string') {
			rows.push(row(`${prefix} (${key})`, usdText(value)));
		}
	}
	return rows;
}

function intervalRows(group: RecordValue | null, prefix: string): OverviewRow[] {
	if (!group) return [];
	return Object.entries(group).flatMap(([key, value]) => {
		if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
			return [row(`${prefix} (${key})`, typeof value === 'boolean' ? value : String(value))];
		}
		return [];
	});
}

function blank(
	source: DataSource,
	kind: 'token' | 'pair',
	chainKey: string,
	error: string
): PageOverview {
	return {
		source,
		kind,
		name: '',
		symbol: '',
		chainKey,
		tokenAddress: null,
		pairAddress: null,
		createdAt: null,
		rows: [],
		pools: [],
		error
	};
}

function geckoPools(body: RecordValue | null, chainKey: string): OverviewPool[] {
	const rows = Array.isArray(body?.data) ? body.data : [];
	const pools: OverviewPool[] = [];
	for (const item of rows) {
		const pool = asRecord(item);
		const attributes = asRecord(pool?.attributes);
		const address = text(attributes, 'address');
		if (!address) continue;
		const volume = nested(attributes, 'volume_usd');
		const change = nested(attributes, 'price_change_percentage');
		const created = text(attributes, 'pool_created_at');
		pools.push({
			name: text(attributes, 'name') || 'Unknown pool',
			pairAddress: address,
			chainKey,
			priceUsd: usdText(attributes?.base_token_price_usd),
			liquidityUsd: usdText(attributes?.reserve_in_usd),
			volume24hUsd: usdText(volume?.h24),
			dex: includedName(body, relationshipId(pool, 'dex')) || 'Gecko Terminal',
			active: true,
			change24h: change?.h24 === undefined ? 'n/a' : `${change.h24}%`,
			createdAt: created || null
		});
	}
	return pools;
}

export async function loadGeckoToken(address: string, chainKey: string): Promise<PageOverview> {
	const network = geckoNetworkFor(chainKey);
	if (!network) return blank('gecko', 'token', chainKey, 'Data not available');
	const slug = network === 'pulse' ? 'pulsechain' : network;
	const encoded = encodeURIComponent(address.trim());
	const tokenResult = await readGeckoDocument(`/networks/${slug}/tokens/${encoded}`);
	const poolsResult = await readGeckoDocument(
		`/networks/${slug}/tokens/${encoded}/pools?page=1&include=base_token,quote_token,dex`
	);
	if ('error' in tokenResult && 'error' in poolsResult) {
		return blank('gecko', 'token', chainKey, tokenResult.error);
	}
	const tokenBody = 'body' in tokenResult ? asRecord(tokenResult.body) : null;
	const tokenData = asRecord(tokenBody?.data);
	const attributes = asRecord(tokenData?.attributes);
	const poolsBody = 'body' in poolsResult ? asRecord(poolsResult.body) : null;
	const pools = geckoPools(poolsBody, chainKey);
	const primary = pools[0];
	const volume = nested(attributes, 'volume_usd');
	const name = text(attributes, 'name') || primary?.name || '';
	const symbol = text(attributes, 'symbol');
	const rows: OverviewRow[] = [
		row('Name', name),
		row('Symbol', symbol),
		row('Chain', chainLabel(chainKey)),
		row('Price (USD)', usdText(attributes?.price_usd ?? primary?.priceUsd)),
		row('24h change', primary?.change24h ?? ''),
		row('Liquidity', primary?.liquidityUsd ?? 'n/a'),
		row('FDV', usdText(attributes?.fdv_usd)),
		row('Market cap', usdText(attributes?.market_cap_usd)),
		row('Volume (24h)', usdText(volume?.h24 ?? primary?.volume24hUsd)),
		...volumeRows(volume, 'Volume').filter((item) => item.label !== 'Volume (h24)'),
		row('Token contract address', text(attributes, 'address') || address),
		row('Primary pair address', primary?.pairAddress ?? ''),
		row('DEX', primary?.dex ?? ''),
		row('Created', ageText(primary?.createdAt)),
		row('Verified', 'n/a'),
		row('Security score', 'n/a'),
		row('Website', ''),
		row('Holders', '')
	];
	return {
		source: 'gecko',
		kind: 'token',
		name,
		symbol,
		chainKey,
		tokenAddress: text(attributes, 'address') || address,
		pairAddress: primary?.pairAddress ?? null,
		createdAt: primary?.createdAt ?? null,
		rows,
		pools,
		error: name ? null : 'Data not available'
	};
}

export async function loadGeckoPair(address: string, chainKey: string): Promise<PageOverview> {
	const network = geckoNetworkFor(chainKey);
	if (!network) return blank('gecko', 'pair', chainKey, 'Data not available');
	const slug = network === 'pulse' ? 'pulsechain' : network;
	const result = await readGeckoDocument(
		`/networks/${slug}/pools/${encodeURIComponent(address.trim())}?include=base_token,quote_token,dex`
	);
	if ('error' in result) {
		const empty = blank('gecko', 'pair', chainKey, result.error);
		empty.pairAddress = address;
		return empty;
	}
	const body = asRecord(result.body);
	const data = asRecord(body?.data);
	const attributes = asRecord(data?.attributes);
	if (!attributes) {
		const empty = blank('gecko', 'pair', chainKey, 'Data not available');
		empty.pairAddress = address;
		return empty;
	}
	const baseId = relationshipId(data, 'base_token');
	const quoteId = relationshipId(data, 'quote_token');
	const baseAddress = includedTokenAddress(body, baseId);
	const quoteName = includedName(body, quoteId);
	const baseName = includedName(body, baseId);
	const baseSymbol = includedField(body, baseId, 'symbol');
	const volume = nested(attributes, 'volume_usd');
	const change = nested(attributes, 'price_change_percentage');
	const transactions = nested(nested(attributes, 'transactions'), 'h24');
	const created = text(attributes, 'pool_created_at');
	const name = text(attributes, 'name') || baseName || 'Unknown pool';
	const rows: OverviewRow[] = [
		row('Name', name),
		row('Symbol', baseSymbol),
		row('Base token', baseName),
		row('Quote token', quoteName),
		row('Chain', chainLabel(chainKey)),
		row('Price (USD)', usdText(attributes.base_token_price_usd)),
		row('24h change', change?.h24 === undefined ? '' : `${change.h24}%`),
		row('Liquidity', usdText(attributes.reserve_in_usd)),
		row('FDV', usdText(attributes.fdv_usd)),
		row('Market cap', usdText(attributes.market_cap_usd)),
		row('Volume (24h)', usdText(volume?.h24)),
		...volumeRows(volume, 'Volume').filter((item) => item.label !== 'Volume (h24)'),
		row('Token contract address', baseAddress),
		row('Pool address', text(attributes, 'address') || address),
		row('DEX', includedName(body, relationshipId(data, 'dex'))),
		row('Created', ageText(created)),
		row('Buys (24h)', transactions?.buys),
		row('Sells (24h)', transactions?.sells),
		row('Buyers (24h)', transactions?.buyers),
		row('Sellers (24h)', transactions?.sellers),
		row('Verified', 'n/a'),
		row('Security score', 'n/a')
	];
	return {
		source: 'gecko',
		kind: 'pair',
		name,
		symbol: baseSymbol || baseName,
		chainKey,
		tokenAddress: baseAddress || null,
		pairAddress: text(attributes, 'address') || address,
		createdAt: created || null,
		rows,
		pools: [],
		error: null
	};
}

function moralisTokenRecord(body: unknown): RecordValue | null {
	const record = asRecord(body);
	if (!record) return null;
	return asRecord(record.token) ?? asRecord(record.result) ?? record;
}

function linkText(links: RecordValue | null): string {
	if (!links) return '';
	const parts: string[] = [];
	for (const [key, value] of Object.entries(links)) {
		if (typeof value === 'string' && value.trim()) parts.push(`${key}: ${value.trim()}`);
	}
	return parts.join('; ');
}

function moralisPools(body: unknown, chainKey: string): OverviewPool[] {
	const record = asRecord(body);
	const rows = Array.isArray(record?.pairs)
		? record.pairs
		: Array.isArray(record?.result)
			? record.result
			: [];
	const pools: OverviewPool[] = [];
	for (const item of rows) {
		const pool = asRecord(item);
		if (!pool) continue;
		const address = text(pool, 'pair_address', 'pairAddress');
		if (!address) continue;
		const inactive = pool.inactive_pair === true || pool.inactivePair === true;
		pools.push({
			name: text(pool, 'pair_label', 'pairLabel') || 'Unknown pool',
			pairAddress: address,
			chainKey,
			priceUsd: usdText(pool.usd_price ?? pool.usdPrice),
			liquidityUsd: usdText(pool.liquidity_usd ?? pool.liquidityUsd),
			volume24hUsd: usdText(pool.volume_24h_usd ?? pool.volume24hUsd),
			dex: text(pool, 'exchange_name', 'exchangeName') || 'n/a',
			active: !inactive,
			change24h: usdText(pool.usd_price_24hr_percent_change ?? pool.usdPrice24hrPercentChange),
			createdAt: null
		});
	}
	return pools;
}

export async function loadMoralisToken(address: string, chainKey: string): Promise<PageOverview> {
	const data = await getTokenData(address, chainKey);
	const pairs = await getTokenPairs(address, chainKey);
	const pools = isApiError(pairs) ? [] : moralisPools(pairs, chainKey);
	if (isApiError(data)) {
		const empty = blank(
			'moralis',
			'token',
			chainKey,
			data.status === 404 ? 'Data not available' : data.error
		);
		empty.tokenAddress = address;
		empty.pools = pools;
		empty.pairAddress = pools[0]?.pairAddress ?? null;
		return empty;
	}
	const token = moralisTokenRecord(data);
	if (!token) {
		const empty = blank('moralis', 'token', chainKey, 'Data not available');
		empty.tokenAddress = address;
		empty.pools = pools;
		return empty;
	}
	const change = nested(token, 'price_percent_change_usd') ?? nested(token, 'pricePercentChange');
	const volume = nested(token, 'volume_change_usd') ?? nested(token, 'volumeChangeUsd');
	const links = nested(token, 'links');
	const name = text(token, 'token_name', 'tokenName', 'name');
	const symbol = text(token, 'token_symbol', 'tokenSymbol', 'symbol');
	const contract = text(token, 'token_address', 'tokenAddress') || address;
	const primary = pools[0];
	const rows: OverviewRow[] = [
		row('Name', name),
		row('Symbol', symbol),
		row('Chain', chainLabel(text(token, 'chain_id', 'chainId') || chainKey)),
		row('Price (USD)', usdText(token.price_usd ?? token.usdPrice ?? token.priceUsd)),
		row('24h change', change?.['24h'] ?? change?.['1d'] ?? ''),
		row(
			'Liquidity',
			token.liquidity_usd != null || token.liquidityUsd != null
				? usdText(token.liquidity_usd ?? token.liquidityUsd)
				: (primary?.liquidityUsd ?? 'n/a')
		),
		row('FDV', usdText(token.fully_diluted_valuation ?? token.fullyDilutedValuation)),
		row('Market cap', usdText(token.market_cap ?? token.marketCap)),
		row('Volume (24h)', usdText(volume?.['24h'] ?? volume?.['1d'] ?? token.volume_24h)),
		...intervalRows(volume, 'Volume').filter(
			(item) => item.label !== 'Volume (24h)' && item.label !== 'Volume (1d)'
		),
		row('Token contract address', contract),
		row('Primary pair address', primary?.pairAddress ?? ''),
		row('DEX', primary?.dex ?? ''),
		row('Created', ageText(token.token_age_in_days ?? token.tokenAgeInDays)),
		row('Verified', token.is_verified_contract ?? token.isVerifiedContract),
		row('Security score', saneNumber(token.security_score ?? token.securityScore)),
		row('Website', linkText(links)),
		row('Holders', saneNumber(token.holders) ?? text(token, 'holders')),
		...intervalRows(nested(token, 'holders_change'), 'Holders change')
	];
	return {
		source: 'moralis',
		kind: 'token',
		name,
		symbol,
		chainKey,
		tokenAddress: contract,
		pairAddress: primary?.pairAddress ?? null,
		createdAt: null,
		rows,
		pools,
		error: name ? null : 'Data not available'
	};
}

export async function loadMoralisPair(address: string, chainKey: string): Promise<PageOverview> {
	const data = await getPairData(address, chainKey);
	if (isApiError(data)) {
		const empty = blank(
			'moralis',
			'pair',
			chainKey,
			data.status === 404 ? 'Data not available' : data.error
		);
		empty.pairAddress = address;
		return empty;
	}
	const pair = asRecord(data);
	if (!pair) {
		const empty = blank('moralis', 'pair', chainKey, 'Data not available');
		empty.pairAddress = address;
		return empty;
	}
	const name = text(pair, 'tokenName', 'token_name', 'pairLabel', 'pair_label') || 'Unknown pool';
	const created = text(pair, 'pairCreated', 'pair_created');
	const rows: OverviewRow[] = [
		row('Name', name),
		row('Symbol', text(pair, 'tokenSymbol', 'token_symbol')),
		row('Base token', text(pair, 'tokenName', 'token_name')),
		row('Quote token', text(pair, 'pairLabel', 'pair_label')),
		row('Chain', chainLabel(chainKey)),
		row('Price (USD)', usdText(pair.currentUsdPrice ?? pair.current_usd_price)),
		row('Native price', pair.currentNativePrice ?? pair.current_native_price),
		row('Liquidity', usdText(pair.totalLiquidityUsd ?? pair.total_liquidity_usd)),
		row('Volume', 'see intervals'),
		...intervalRows(nested(pair, 'totalVolume') ?? nested(pair, 'total_volume'), 'Total volume'),
		...intervalRows(
			nested(pair, 'pricePercentChange') ?? nested(pair, 'price_percent_change'),
			'Price change'
		),
		...intervalRows(nested(pair, 'buys'), 'Buys'),
		...intervalRows(nested(pair, 'sells'), 'Sells'),
		row('Token contract address', text(pair, 'tokenAddress', 'token_address')),
		row('Pool address', text(pair, 'pairAddress', 'pair_address') || address),
		row('DEX', text(pair, 'exchange', 'exchange_name')),
		row('Created', ageText(created)),
		row('Verified', 'n/a'),
		row('Security score', 'n/a')
	];
	return {
		source: 'moralis',
		kind: 'pair',
		name,
		symbol: text(pair, 'tokenSymbol', 'token_symbol'),
		chainKey,
		tokenAddress: text(pair, 'tokenAddress', 'token_address') || null,
		pairAddress: text(pair, 'pairAddress', 'pair_address') || address,
		createdAt: created || null,
		rows,
		pools: [],
		error: null
	};
}

export async function loadTokenPage(
	source: DataSource,
	address: string,
	chain: string | undefined
): Promise<PageOverview> {
	const chainKey = resolveAppChainKey(chain);
	if (!chainKey) return blank(source, 'token', chain ?? '', `Unknown chain "${chain ?? ''}".`);
	try {
		return source === 'moralis'
			? await loadMoralisToken(address, chainKey)
			: await loadGeckoToken(address, chainKey);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Data not available';
		const empty = blank(source, 'token', chainKey, message);
		empty.tokenAddress = address;
		return empty;
	}
}

export async function loadPairPage(
	source: DataSource,
	address: string,
	chain: string | undefined
): Promise<PageOverview> {
	const chainKey = resolveAppChainKey(chain);
	if (!chainKey) return blank(source, 'pair', chain ?? '', `Unknown chain "${chain ?? ''}".`);
	try {
		return source === 'moralis'
			? await loadMoralisPair(address, chainKey)
			: await loadGeckoPair(address, chainKey);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Data not available';
		const empty = blank(source, 'pair', chainKey, message);
		empty.pairAddress = address;
		return empty;
	}
}
