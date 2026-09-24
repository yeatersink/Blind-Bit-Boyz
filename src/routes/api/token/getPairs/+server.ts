import { json } from '@sveltejs/kit';
import { listGeckoTokenPools } from '$lib/server/gecko';
import { getTokenPairs, isApiError } from '$lib/server/tokens.js';

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address') ?? undefined;
	const chain = url.searchParams.get('chain') ?? undefined;
	const source = url.searchParams.get('source') ?? 'gecko';

	if (!address || !chain) {
		return json({ error: 'Token address and chain are required' }, { status: 400 });
	}
	if (source !== 'gecko' && source !== 'moralis') {
		return json({ error: 'Data source must be gecko or moralis.' }, { status: 400 });
	}

	try {
		if (source === 'gecko') {
			const pools = await listGeckoTokenPools(address, chain);
			if ('error' in pools) {
				return json({ error: pools.error, pairs: [], page_size: 0 }, { status: pools.status });
			}
			return json(pools);
		}

		const pairs = await getTokenPairs(address, chain);
		if (isApiError(pairs)) {
			return json({ error: pairs.error, pairs: [], page_size: 0 }, { status: pairs.status });
		}
		return json(pairs);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch pairs';
		return json({ error: message, pairs: [], page_size: 0 }, { status: 502 });
	}
};
