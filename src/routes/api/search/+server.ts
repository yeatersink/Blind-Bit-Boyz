import { json } from '@sveltejs/kit';
import { searchGecko } from '$lib/server/gecko';
import { isApiError, normalizeMoralisSearch, searchTokens } from '$lib/server/tokens';
import { resolveAppChainKey } from '$lib/utils/chains';

export const GET = async ({ url }) => {
	const source = url.searchParams.get('source') ?? 'gecko';
	const search = url.searchParams.get('search') ?? '';
	const chain = url.searchParams.get('chain') ?? 'eth';
	const verifiedParam = url.searchParams.get('verified');
	const verified = verifiedParam === 'true';
	const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
	const sortBy = url.searchParams.get('sortBy') ?? undefined;
	const boostVerified = url.searchParams.get('boostVerified') === 'true';

	if (!search.trim()) {
		return json({ error: 'Search term is required' }, { status: 400 });
	}
	if (source !== 'gecko' && source !== 'moralis') {
		return json({ error: 'Data source must be gecko or moralis.' }, { status: 400 });
	}
	if (!resolveAppChainKey(chain)) {
		return json({ error: `Unknown chain "${chain}".` }, { status: 400 });
	}

	try {
		if (source === 'moralis') {
			const data = await searchTokens(search, chain, verified, boostVerified, limit, sortBy);
			if (isApiError(data)) {
				return json({ error: data.error }, { status: data.status });
			}
			return json(normalizeMoralisSearch(data.data, chain));
		}

		const data = await searchGecko(search, chain);
		if ('error' in data) {
			return json({ error: data.error }, { status: data.status });
		}
		return json(data);
	} catch (error) {
		const message =
			typeof error === 'object' && error !== null && 'message' in error
				? (error as { message: string }).message
				: 'An error occurred while searching';
		return json({ error: message }, { status: 500 });
	}
};
