import { getBestBoard, PriceWatchApiError, type RankingRow } from '$lib/priceWatchApi';

export type BestPerformingResult = { rows: RankingRow[] } | { error: string; status: number };

/** Live top 10 from rankings window 10, or window 1h when that list is empty. */
export async function bestPerforming(): Promise<BestPerformingResult> {
	try {
		return { rows: await getBestBoard() };
	} catch (error) {
		const message =
			error instanceof PriceWatchApiError
				? error.message
				: 'The best performing list could not be loaded.';
		const status = error instanceof PriceWatchApiError && error.status >= 400 ? error.status : 502;
		return { error: message, status };
	}
}
