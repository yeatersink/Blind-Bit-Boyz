import { json } from '@sveltejs/kit';
import { getBestBoard, omitRpc, PriceWatchApiError } from '$lib/priceWatchApi';

/** Live top 10 from rankings window 10, or window 1h when that list is empty. */
export const GET = async () => {
	try {
		return json(omitRpc({ data: await getBestBoard() }));
	} catch (error) {
		const status = error instanceof PriceWatchApiError && error.status >= 400 ? error.status : 502;
		return json({ error: 'The best performing list could not be loaded.' }, { status });
	}
};
