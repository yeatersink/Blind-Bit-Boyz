// Accepts /token/:id?chain=<app key>. Source comes from ?source= or the dataSource cookie.
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { loadTokenPage } from '$lib/server/pageData';
import { geckoNetworkFor, moralisChainFor, resolveAppChainKey } from '$lib/utils/chains';
import type { DataSource } from '$lib/utils/searchResults';

function requestedSource(url: URL, cookies: Cookies): DataSource {
	const query = url.searchParams.get('source');
	if (query === 'gecko' || query === 'moralis') return query;
	return cookies.get('dataSource') === 'moralis' ? 'moralis' : 'gecko';
}

export const load = async ({ params, url, cookies }) => {
	const id = params.id;
	const chain = url.searchParams.get('chain') ?? undefined;
	const chainKey = resolveAppChainKey(chain) ?? null;
	const source = requestedSource(url, cookies);
	const mapped = {
		id,
		chain,
		chainKey,
		source,
		geckoNetwork: geckoNetworkFor(chain) ?? null,
		moralisChain: moralisChainFor(chain) ?? null,
		adapter: source
	};
	if (!id) {
		return {
			overview: null,
			error: 'Token address is required',
			tokenAddress: null,
			chainKey,
			source
		};
	}
	try {
		const overview = await loadTokenPage(source, id, chainKey ?? chain);
		if (dev) console.log('token load', { ...mapped, error: overview.error });
		return { overview, error: overview.error, tokenAddress: id, chainKey, source };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Data not available';
		if (dev) console.log('token load', { ...mapped, error: message });
		return { overview: null, error: message, tokenAddress: id, chainKey, source };
	}
};
