export type CurrencyKey = 'usd' | 'native';

export type IntervalKey =
	| '1s'
	| '10s'
	| '30s'
	| '1min'
	| '5min'
	| '10min'
	| '30min'
	| '1h'
	| '4h'
	| '12h'
	| '1d'
	| '1w'
	| '1m';

export const currencyList: Record<CurrencyKey, { text: string }> = {
	usd: { text: 'USD' },
	native: { text: 'Native' }
};

export const dataIntervalsList: Record<IntervalKey, { text: string }> = {
	'1s': { text: '1 second' },
	'10s': { text: '10 seconds' },
	'30s': { text: '30 seconds' },
	'1min': { text: '1 minute' },
	'5min': { text: '5 minutes' },
	'10min': { text: '10 minutes' },
	'30min': { text: '30 minutes' },
	'1h': { text: '1 hour' },
	'4h': { text: '4 hours' },
	'12h': { text: '12 hours' },
	'1d': { text: '1 day' },
	'1w': { text: '1 week' },
	'1m': { text: '1 month' }
};
