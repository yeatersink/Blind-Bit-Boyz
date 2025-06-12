import { getTokenData } from '$lib/server/tokens.js';

export const load = async ({ params, url }) => {
	const id = params.id;
	const chain = url.searchParams.get('chain') ?? undefined;
	if (!id) {
		return {
			error: 'Token address is required'
		};
	}

	const data = await getTokenData(id, chain);

	if (data.error) {
		return {
			error: data.error
		};
	}

	return {
		data
	};
};
