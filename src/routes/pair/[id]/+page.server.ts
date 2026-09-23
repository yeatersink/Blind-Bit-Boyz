// Accepts /pair/:id?chain=<app key, Moralis chain name, Gecko slug, or hex/decimal chain id>.
import { dev } from '$app/environment';
import { getPairData, isApiError } from '$lib/server/tokens.js';
import { geckoNetworkFor, moralisChainFor, resolveAppChainKey } from '$lib/utils/chains';

function pairRecord(value: unknown): Record<string, unknown> | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const address = record.pairAddress ?? record.pair_address;
	const name = record.tokenName ?? record.token_name ?? record.pairLabel ?? record.pair_label;
	if (typeof address !== 'string' && typeof name !== 'string') return null;
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
		return { data: null, error: 'Pair address is required', pairAddress: null, chainKey };
	}

	try {
		const stats = await getPairData(id, chainKey ?? chain);
		const record = pairRecord(stats);
		if (isApiError(stats) || !record) {
			const message = isApiError(stats)
				? stats.error
				: 'Pair stats are not available from Moralis. The chart can still load from Gecko Terminal.';
			if (dev) console.log('pair load', { ...mapped, error: message });
			return { pairAddress: id, chainKey, data: null, error: message };
		}
		if (dev) console.log('pair load', { ...mapped, error: null });
		return { pairAddress: id, chainKey, data: record as any, error: null };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load pair';
		if (dev) console.log('pair load', { ...mapped, error: message });
		return { pairAddress: id, chainKey, data: null, error: message };
	}
};
