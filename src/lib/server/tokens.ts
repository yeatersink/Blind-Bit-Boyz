import { dev } from '$app/environment';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';
import { getMoralisApiKey, MORALIS_UNAVAILABLE, moralisInitialized } from '$lib/server/moralis';
import { finiteNumber, parseTimestamp, type Candle } from '$lib/utils/candles';
import {
	chartIntervals,
	isCurrencyKey,
	isIntervalKey,
	MORALIS_INTERVAL_UNAVAILABLE
} from '$lib/utils/common';
import { moralisChainFor, resolveAppChainKey } from '$lib/utils/chains';
import type { SearchHit, SearchPayload } from '$lib/utils/searchResults';

type MoralisFailure = { error: string; status: number };
type MoralisSuccess = { body: unknown };

function moralisChainParam(chain: string | undefined): string {
	if (!chain || !chain.trim()) return 'eth';
	return moralisChainFor(chain) ?? chain.trim();
}

export function isApiError(value: unknown): value is MoralisFailure {
	return (
		!!value &&
		typeof value === 'object' &&
		'status' in value &&
		typeof (value as MoralisFailure).status === 'number' &&
		'error' in value &&
		typeof (value as MoralisFailure).error === 'string'
	);
}

async function moralisGet(url: string): Promise<MoralisSuccess | MoralisFailure> {
	if (!moralisInitialized) {
		return { error: MORALIS_UNAVAILABLE, status: 503 };
	}
	const apiKey = getMoralisApiKey();
	if (!apiKey) {
		return { error: MORALIS_UNAVAILABLE, status: 503 };
	}

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				'X-API-Key': apiKey,
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			let message = 'Moralis request failed';
			try {
				const body = (await response.json()) as { message?: unknown; error?: unknown };
				if (typeof body?.message === 'string' && body.message) message = body.message;
				else if (typeof body?.error === 'string' && body.error) message = body.error;
			} catch {
				message = response.statusText || message;
			}
			const status =
				response.status === 401 || response.status === 403
					? 503
					: response.status === 429
						? 429
						: response.status >= 500
							? 502
							: response.status;
			return { error: message, status };
		}
		return { body: await response.json() };
	} catch {
		console.error('Moralis request failed');
		return { error: 'Failed to reach Moralis', status: 502 };
	}
}

function failureMessage(result: MoralisSuccess | MoralisFailure, fallback: string): MoralisFailure {
	if ('error' in result) return result;
	return { error: fallback, status: 502 };
}

export async function getTokenHistoricalPrice(
	address: string = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
	chain = EvmChain.ETHEREUM
) {
	const historicalPrice = [];

	if (!moralisInitialized) {
		return {
			error: MORALIS_UNAVAILABLE,
			status: 503
		};
	}

	try {
		for (let toBlock = 16323500; toBlock < 16323550; toBlock += 10) {
			const response = await Moralis.EvmApi.token.getTokenPrice({
				address,
				chain,
				toBlock
			});

			historicalPrice.push(response?.toJSON());
		}
	} catch (error) {
		console.error('Error fetching historical price:', error);
		return {
			error: 'Failed to fetch historical price data',
			status: 502
		};
	}
	return historicalPrice;
}

function normalizeMoralisCandles(result: unknown): Candle[] {
	if (!Array.isArray(result)) return [];
	const candles: Candle[] = [];
	for (const row of result) {
		if (!row || typeof row !== 'object') continue;
		const item = row as Record<string, unknown>;
		const timestamp = parseTimestamp(item.timestamp);
		const open = finiteNumber(item.open);
		const high = finiteNumber(item.high);
		const low = finiteNumber(item.low);
		const close = finiteNumber(item.close);
		if (![timestamp, open, high, low, close].every(Number.isFinite)) continue;
		const volume = finiteNumber(item.volume);
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

export async function getPairCandelstickData(
	address: string,
	chain: string | undefined = 'eth',
	startMs: number | undefined = undefined,
	endMs: number | undefined = undefined,
	interval: string | undefined = '1h',
	currency: string | undefined = 'usd'
): Promise<{ candles: Candle[]; warning?: string } | MoralisFailure> {
	if (!address || !address.trim()) {
		return { error: 'Pair address is required', status: 400 };
	}
	if (!isIntervalKey(interval)) {
		return { error: `Unknown interval "${interval ?? ''}".`, status: 400 };
	}
	const spec = chartIntervals[interval];
	if (!spec.moralis) {
		return { error: MORALIS_INTERVAL_UNAVAILABLE, status: 400 };
	}
	if (!isCurrencyKey(currency)) {
		return { error: 'Currency must be usd or native.', status: 400 };
	}

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

	const chainValue = moralisChainParam(chain);
	const fromDate = new Date(resolvedStart).toISOString();
	const toDate = new Date(resolvedEnd).toISOString();
	const collected = new Map<number, Candle>();
	let cursor = '';
	let truncated = false;
	const pageSize = 1000;
	const spanMs = spec.intervalMs ?? 30 * 24 * 60 * 60 * 1000;
	const needed = Math.max(1, Math.ceil((resolvedEnd - resolvedStart) / spanMs));
	const maxPages = Math.min(20, Math.max(1, Math.ceil(needed / pageSize)));

	for (let page = 0; page < maxPages; page += 1) {
		const params = new URLSearchParams({
			chain: chainValue,
			timeframe: spec.moralis,
			fromDate,
			toDate,
			currency,
			limit: String(pageSize)
		});
		if (cursor) params.set('cursor', cursor);
		const url = `https://deep-index.moralis.io/api/v2.2/pairs/${encodeURIComponent(address.trim())}/ohlcv?${params}`;
		if (dev) console.log(`Moralis OHLCV ${url}`);
		const result = await moralisGet(url);
		if ('error' in result) return result;
		const body = result.body as { result?: unknown; cursor?: unknown };
		for (const candle of normalizeMoralisCandles(body.result)) {
			collected.set(candle.timestamp, candle);
		}
		cursor = typeof body.cursor === 'string' ? body.cursor : '';
		if (!cursor) break;
		if (page === maxPages - 1) truncated = true;
	}

	const candles = [...collected.values()]
		.filter((candle) => candle.timestamp >= resolvedStart && candle.timestamp <= resolvedEnd)
		.sort((a, b) => a.timestamp - b.timestamp);
	if (truncated) {
		return {
			candles,
			warning: 'Moralis returned a partial window. Narrow the range or use a larger interval.'
		};
	}
	return { candles };
}

export async function getPairData(
	address: string,
	chain: string | undefined = 'eth'
): Promise<any> {
	if (dev) {
		console.log('Pair address:', address);
		console.log('Chain:', chain);
	}
	const chainValue = moralisChainParam(chain);
	const params = new URLSearchParams({ chain: chainValue });
	const url = `https://deep-index.moralis.io/api/v2.2/pairs/${encodeURIComponent(address)}/stats?${params}`;
	const result = await moralisGet(url);
	if ('error' in result) return result;
	if (!result.body || typeof result.body !== 'object') {
		return failureMessage(result, 'Failed to fetch pair data');
	}
	return result.body;
}

export async function getTokenData(
	address: string,
	chain: string | undefined = 'eth'
): Promise<any> {
	const chainValue = moralisChainParam(chain);
	const params = new URLSearchParams({
		chain: chainValue,
		token_address: address
	});
	const url = `https://deep-index.moralis.io/api/v2.2/discovery/token?${params}`;
	const result = await moralisGet(url);
	if ('error' in result) return result;
	if (!result.body || typeof result.body !== 'object') {
		return { error: 'Failed to fetch token data', status: 502 };
	}
	return result.body;
}

export async function searchTokens(
	search: string,
	chain: string | undefined = 'eth',
	verified: boolean | undefined = false,
	boostVerified: boolean | undefined = false,
	limit: number | undefined = 10,
	sortBy: string | undefined = 'marketCapDesc'
): Promise<{ data: unknown } | MoralisFailure> {
	const params = new URLSearchParams({
		query: search,
		chains: moralisChainParam(chain),
		isVerifiedContract: String(verified ?? false),
		limit: String(Number.isFinite(limit) ? limit : 10),
		sortBy: sortBy && sortBy.trim() ? sortBy.trim() : 'marketCapDesc',
		boostVerifiedContracts: String(boostVerified ?? false)
	});
	const url = `https://deep-index.moralis.io/api/v2.2/tokens/search?${params}`;
	const result = await moralisGet(url);
	if ('error' in result) return result;
	return { data: result.body };
}

function textField(record: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return '';
}

export function normalizeMoralisSearch(
	body: unknown,
	requestedChain: string | undefined
): SearchPayload {
	const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
	const rows = Array.isArray(record.result) ? record.result : [];
	const fallback = resolveAppChainKey(requestedChain) ?? 'eth';
	const result: SearchHit[] = [];
	for (const row of rows) {
		if (!row || typeof row !== 'object') continue;
		const item = row as Record<string, unknown>;
		const tokenAddress = textField(item, 'tokenAddress', 'token_address', 'address');
		if (!tokenAddress) continue;
		const chainKey = resolveAppChainKey(textField(item, 'chainId', 'chain_id')) ?? fallback;
		const price = item.usdPrice ?? item.usd_price;
		const volume = item.volume24h ?? item.volume_24h ?? item.totalVolume;
		const score = item.securityScore ?? item.security_score;
		const verified = item.isVerifiedContract ?? item.is_verified_contract;
		result.push({
			type: 'token',
			name: textField(item, 'name') || 'Unknown token',
			symbol: textField(item, 'symbol'),
			tokenAddress,
			chainKey,
			chainId: chainKey,
			priceUsd: typeof price === 'number' || typeof price === 'string' ? price : null,
			volumeUsd: typeof volume === 'number' || typeof volume === 'string' ? volume : null,
			verified: typeof verified === 'boolean' ? verified : null,
			securityScore: typeof score === 'number' ? score : null
		});
	}
	const reported = Number(record.total);
	return {
		source: 'moralis',
		total: Number.isFinite(reported) ? reported : result.length,
		result
	};
}

export async function getTokenPairs(
	tokenAddress: string,
	chainId: string | undefined = 'eth'
): Promise<any> {
	const chainValue = moralisChainParam(chainId);
	const params = new URLSearchParams({ chain: chainValue });
	const url = `https://deep-index.moralis.io/api/v2.2/erc20/${encodeURIComponent(tokenAddress)}/pairs?${params}`;
	const result = await moralisGet(url);
	if ('error' in result) return result;
	if (!result.body || typeof result.body !== 'object') {
		return { error: 'Failed to fetch token pairs', status: 502 };
	}
	return result.body;
}
