import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { getGeckoCandles } from '$lib/server/gecko';
import { getPairCandelstickData } from '$lib/server/tokens';

function readMillis(value: string | null): number | undefined {
	if (value == null || value.trim() === '') return undefined;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : Number.NaN;
}

export const GET = async ({ url }) => {
	const address = url.searchParams.get('address');
	const chain = url.searchParams.get('chain') ?? undefined;
	const startMs = readMillis(url.searchParams.get('startMs'));
	const endMs = readMillis(url.searchParams.get('endMs'));
	const interval = url.searchParams.get('interval') ?? undefined;
	const currency = url.searchParams.get('currency') ?? undefined;
	const source = url.searchParams.get('source') ?? 'gecko';

	if (!address) {
		return json({ error: 'Pair address is required' }, { status: 400 });
	}
	if (source !== 'gecko' && source !== 'moralis') {
		return json({ error: 'Data source must be gecko or moralis.' }, { status: 400 });
	}
	if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
		return json({ error: 'Start or end is not a valid date.' }, { status: 400 });
	}
	if (dev) {
		console.log('Candle window', { source, chain: chain ?? '', interval, startMs, endMs });
	}

	const data =
		source === 'moralis'
			? await getPairCandelstickData(address, chain, startMs, endMs, interval, currency)
			: await getGeckoCandles(address, chain, startMs, endMs, interval, currency);

	if ('error' in data) {
		return json({ error: data.error }, { status: data.status });
	}

	return json({
		source,
		candles: data.candles,
		...(data.warning ? { warning: data.warning } : {})
	});
};
