import { getPairCandelstickData } from '$lib/server/tokens';

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address');
	const chain = url.searchParams.get('chain') ?? undefined;
	const startDateParam = url.searchParams.get('startDate');
	const startDate = startDateParam !== null ? startDateParam : undefined;
	const endDateParam = url.searchParams.get('endDate');
	const endDate = endDateParam !== null ? endDateParam : undefined;
	const interval = url.searchParams.get('interval') ?? undefined;
	const currency = url.searchParams.get('currency') ?? undefined;
	if (!address) {
		return new Response(JSON.stringify({ error: 'Pair address is required' }), { status: 400 });
	}
	const data = await getPairCandelstickData(address, chain, startDate, endDate, interval, currency);

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
