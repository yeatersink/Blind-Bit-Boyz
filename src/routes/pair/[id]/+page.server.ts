import { getPairCandelstickData } from '$lib/server/tokens';

export const load = async ({ params }) => {
	const id = params.id;
	const data = await getPairCandelstickData(id);

	if (data.error) {
		return {
			error: data.error
		};
	}

	return {
		token: data
	};
};
