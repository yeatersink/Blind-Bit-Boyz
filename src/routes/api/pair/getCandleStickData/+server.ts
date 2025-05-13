import { getPairCandelstickData } from '$lib/server/tokens';

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address');
	const chain = url.searchParams.get('chain') ?? undefined;
	const startDateParam = url.searchParams.get('startDate');
	const startDate = startDateParam !== null ? new Date(startDateParam) : undefined;
	const endDateParam = url.searchParams.get('endDate');
	const endDate = endDateParam !== null ? new Date(endDateParam) : undefined;
	const interval = url.searchParams.get('interval') ?? undefined;
	if (!address) {
		return new Response(JSON.stringify({ error: 'Pair address is required' }), { status: 400 });
	}
	const data = await getPairCandelstickData(address, chain, startDate, endDate, interval);

	if (data.error) {
		return new Response(JSON.stringify({ error: data.error }), { status: 500 });
	}

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
