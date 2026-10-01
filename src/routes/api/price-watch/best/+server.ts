import { json } from '@sveltejs/kit';
import { bestPerforming } from '$lib/server/bestPerforming';

export const GET = async ({ url }) => {
	const chainId = url.searchParams.get('chain_id') ?? '';
	try {
		const result = await bestPerforming(chainId);
		if ('error' in result) return json({ error: result.error }, { status: result.status });
		return json({ data: result.rows });
	} catch {
		return json({ error: 'The best performing list could not be loaded.' }, { status: 502 });
	}
};
