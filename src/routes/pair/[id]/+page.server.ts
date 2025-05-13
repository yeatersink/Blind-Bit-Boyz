import { getPairData } from '$lib/server/tokens.js';

export const load = async ({ params }) => {
	const id = params.id;
	if (!id) {
		return {
			error: 'Pair address is required'
		};
	}

	const data = await getPairData(id);

	if (data.error) {
		return {
			error: data.error
		};
	}

	return {
		data
	};
};
