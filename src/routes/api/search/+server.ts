import { json } from '@sveltejs/kit';
import { searchTokens } from '$lib/server/tokens';

export const GET = async ({ url }) => {
	const search = url.searchParams.get('search') ?? undefined;
	const chain = url.searchParams.get('chain') ?? undefined;
	const verifiedParam = url.searchParams.get('verified');
	const verified = verifiedParam === null ? undefined : verifiedParam === 'true';
	const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
	const sortBy = url.searchParams.get('sortBy') ?? undefined;
	const boostVerifiedParam = url.searchParams.get('boostVerified');
	const boostVerified = boostVerifiedParam === null ? undefined : boostVerifiedParam === 'true';

	if (!search) {
		return json({ error: 'Search term is required' }, { status: 400 });
	}

	try {
		const data = await searchTokens(search, chain, verified, boostVerified, limit, sortBy);
		if (!data || data.error) {
			return json({ error: 'Failed to fetch search results' });
		}

		return json({ data: await data.json() });
	} catch (error) {
		const message =
			typeof error === 'object' && error !== null && 'message' in error
				? (error as { message: string }).message
				: 'An error occurred while searching tokens';
		return json({ error: message }, { status: 500 });
	}
};
