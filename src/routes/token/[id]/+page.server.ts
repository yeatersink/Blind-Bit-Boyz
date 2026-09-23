// Accepts /token/:id?chain=<app key, Moralis chain name, Gecko slug, or hex/decimal chain id>.
import { dev } from '$app/environment';
import { getTokenData, isApiError } from '$lib/server/tokens.js';
import { geckoNetworkFor, moralisChainFor, resolveAppChainKey } from '$lib/utils/chains';

function tokenRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const address = record.token_address ?? record.tokenAddress;
	if (typeof address !== 'string' || !address.trim()) return null;
	return record;
}

export const load = async ({ params, url }) => {
	const id = params.id;
	const chain = url.searchParams.get('chain') ?? undefined;
	const chainKey = resolveAppChainKey(chain) ?? null;
	const mapped = {
		id,
		chain,
		chainKey,
		geckoNetwork: geckoNetworkFor(chain) ?? null,
		moralisChain: moralisChainFor(chain) ?? null,
		adapter: 'moralis'
	};
	if (!id) {
		return {
			data: null,
			error: 'Token address is required',
			tokenAddress: null,
			chainKey,
			sourceHint: null
		};
	}

	try {
		const data = await getTokenData(id, chainKey ?? chain);
		const record = tokenRecord(data);
		if (isApiError(data) || !record) {
			const message = isApiError(data)
				? data.error
				: 'Data not available from Moralis. Open a pool from the pairs list, or switch to Gecko Terminal.';
			if (dev) console.log('token load', { ...mapped, error: message });
			return {
				data: null,
				error: message,
				tokenAddress: id,
				chainKey,
				sourceHint: 'Gecko Terminal can still list pools for this token.'
			};
		}
		if (dev) console.log('token load', { ...mapped, error: null });
		return { data: record as any, tokenAddress: id, chainKey, error: null, sourceHint: null };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load token';
		if (dev) console.log('token load', { ...mapped, error: message });
		return {
			data: null,
			error: message,
			tokenAddress: id,
			chainKey,
			sourceHint: 'Gecko Terminal can still list pools for this token.'
		};
	}
};
