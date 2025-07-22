import { getPairData } from '$lib/server/tokens.js';

export const load = async ({ params, url }) => {
	const id = params.id;
	const chain = url.searchParams.get('chain') ?? undefined;
	if (!id) {
		return {
			error: 'Pair address is required'
		};
	}

	const data = await getPairData(id, chain);

	if (data.error) {
		return {
			error: data.error
		};
	}

	return {
		data
	};
};
