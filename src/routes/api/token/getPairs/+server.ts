import { json } from '@sveltejs/kit';
import { getTokenPairs } from '$lib/server/tokens.js';

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address') ?? undefined;
	const chain = url.searchParams.get('chain') ?? undefined;

	if (!address || !chain) {
		return json({ error: 'Token address and chain are required' }, { status: 400 });
	}

	const pairs = await getTokenPairs(address, chain);
	if (pairs.error) {
		return json({ error: pairs.error }, { status: 500 });
	}

	return json(pairs);
};
