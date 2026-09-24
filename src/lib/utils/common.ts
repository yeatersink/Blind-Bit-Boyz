export type CurrencyKey = 'usd' | 'native';
export type ChartDataVendor = 'gecko' | 'moralis';
export type GeckoTimeframe = 'minute' | 'hour' | 'day';

export type IntervalKey =
	| '1s'
	| '10s'
	| '30s'
	| '1min'
	| '5min'
	| '10min'
	| '15min'
	| '30min'
	| '1h'
	| '4h'
	| '12h'
	| '1d'
	| '1w'
	| '1M';

export type IntervalSpec = {
	text: string;
	/** Candle width in milliseconds. Null for calendar months. */
	intervalMs: number | null;
	/** Moralis timeframe. Null when that source cannot serve the interval. */
	moralis: string | null;
	/** Public GeckoTerminal pool OHLCV. Null when that source cannot serve the interval. */
	gecko: { timeframe: GeckoTimeframe; aggregate: number } | null;
};

export const currencyList: Record<CurrencyKey, { text: string }> = {
	usd: { text: 'USD' },
	native: { text: 'Native' }
};

/**
 * Single interval table. UI labels, candle width, and both vendor mappings live here.
 * Public Gecko pool OHLCV (Accept version 20230203) is minute/hour/day only.
 * Minute aggregates are 1, 5, and 15. Hour aggregates are 1, 4, and 12. Day is 1.
 * There is no 24h candle key. A Moralis day candle is 1d.
 */
export const chartIntervals: Record<IntervalKey, IntervalSpec> = {
	'1s': { text: '1 second', intervalMs: 1_000, moralis: '1s', gecko: null },
	'10s': { text: '10 seconds', intervalMs: 10_000, moralis: '10s', gecko: null },
	'30s': { text: '30 seconds', intervalMs: 30_000, moralis: '30s', gecko: null },
	'1min': {
		text: '1 minute',
		intervalMs: 60_000,
		moralis: '1min',
		gecko: { timeframe: 'minute', aggregate: 1 }
	},
	'5min': {
		text: '5 minutes',
		intervalMs: 300_000,
		moralis: '5min',
		gecko: { timeframe: 'minute', aggregate: 5 }
	},
	'10min': { text: '10 minutes', intervalMs: 600_000, moralis: '10min', gecko: null },
	'15min': {
		text: '15 minutes',
		intervalMs: 900_000,
		moralis: null,
		gecko: { timeframe: 'minute', aggregate: 15 }
	},
	'30min': { text: '30 minutes', intervalMs: 1_800_000, moralis: '30min', gecko: null },
	'1h': {
		text: '1 hour',
		intervalMs: 3_600_000,
		moralis: '1h',
		gecko: { timeframe: 'hour', aggregate: 1 }
	},
	'4h': {
		text: '4 hours',
		intervalMs: 14_400_000,
		moralis: '4h',
		gecko: { timeframe: 'hour', aggregate: 4 }
	},
	'12h': {
		text: '12 hours',
		intervalMs: 43_200_000,
		moralis: '12h',
		gecko: { timeframe: 'hour', aggregate: 12 }
	},
	'1d': {
		text: '1 day',
		intervalMs: 86_400_000,
		moralis: '1d',
		gecko: { timeframe: 'day', aggregate: 1 }
	},
	'1w': { text: '1 week', intervalMs: 604_800_000, moralis: '1w', gecko: null },
	'1M': { text: '1 month', intervalMs: null, moralis: '1M', gecko: null }
};

export const dataIntervalsList: Record<IntervalKey, { text: string }> = Object.fromEntries(
	Object.entries(chartIntervals).map(([key, spec]) => [key, { text: spec.text }])
) as Record<IntervalKey, { text: string }>;

export const GECKO_INTERVAL_UNAVAILABLE = 'This interval is not available from Gecko Terminal.';
export const MORALIS_INTERVAL_UNAVAILABLE = 'This interval is not available from Moralis.';
export const GECKO_CANDLE_CAP =
	'Gecko returns at most 1000 candles; pick a larger candle size or a shorter range.';
/** Five pages of the public 1000-candle limit. Larger requests are refused before any call. */
export const GECKO_MAX_CANDLES = 5_000;
export const NEED_LONGER_WINDOW = 'Need a longer window or a source that serves this candle size.';
export const HISTORY_FALLBACK =
	'Loaded the last year. Full history is not available from this API in one call.';

export function intervalSupported(interval: IntervalKey, source: ChartDataVendor): boolean {
	const spec = chartIntervals[interval];
	return source === 'gecko' ? spec.gecko != null : spec.moralis != null;
}

export function intervalOptionNote(interval: string, source: ChartDataVendor): string | null {
	if (!isIntervalKey(interval) || intervalSupported(interval, source)) return null;
	return source === 'gecko' ? 'Not available from Gecko Terminal' : 'Not available from Moralis';
}

export type IndicatorPane = 'overlay' | 'oscillator';

export type ChartIndicator = {
	value: string;
	label: string;
	pane: IndicatorPane;
	needsVolume?: boolean;
	defaultParams?: Record<string, number>;
};

// Series type strings match Highcharts 11.4.8 registerSeriesType names.
// linearRegression* is camelCase in this build. vwap is labeled VWAP and wma is labeled WMA.
const chartIndicatorList: ChartIndicator[] = [
	{ value: 'sma', label: 'Simple Moving Average', pane: 'overlay' },
	{ value: 'ema', label: 'Exponential Moving Average', pane: 'overlay' },
	{ value: 'dema', label: 'Double EMA', pane: 'overlay' },
	{ value: 'tema', label: 'Triple EMA', pane: 'overlay' },
	{ value: 'wma', label: 'Weighted Moving Average', pane: 'overlay' },
	{ value: 'vwap', label: 'Volume Weighted Average Price', pane: 'overlay', needsVolume: true },
	{ value: 'bb', label: 'Bollinger Bands', pane: 'overlay' },
	{ value: 'abands', label: 'Acceleration Bands', pane: 'overlay' },
	{ value: 'keltnerchannels', label: 'Keltner Channels', pane: 'overlay' },
	{ value: 'priceenvelopes', label: 'Price Envelopes', pane: 'overlay' },
	{ value: 'pc', label: 'Price Channel', pane: 'overlay' },
	{ value: 'psar', label: 'Parabolic SAR', pane: 'overlay' },
	{ value: 'supertrend', label: 'Supertrend', pane: 'overlay' },
	{ value: 'pivotpoints', label: 'Pivot Points', pane: 'overlay' },
	{ value: 'ikh', label: 'Ichimoku Kinko Hyo', pane: 'overlay' },
	{ value: 'linearRegression', label: 'Linear Regression', pane: 'overlay' },
	{ value: 'trendline', label: 'Trend line', pane: 'overlay' },
	{ value: 'zigzag', label: 'Zig Zag', pane: 'overlay' },
	{ value: 'vbp', label: 'Volume by Price', pane: 'overlay', needsVolume: true },
	{ value: 'rsi', label: 'Relative Strength Index', pane: 'oscillator' },
	{
		value: 'macd',
		label: 'MACD',
		pane: 'oscillator',
		defaultParams: { shortPeriod: 12, longPeriod: 26, signalPeriod: 9 }
	},
	{ value: 'stochastic', label: 'Stochastic', pane: 'oscillator' },
	{ value: 'slowstochastic', label: 'Slow Stochastic', pane: 'oscillator' },
	{ value: 'cci', label: 'Commodity Channel Index', pane: 'oscillator' },
	{ value: 'atr', label: 'Average True Range', pane: 'oscillator' },
	{ value: 'natr', label: 'Normalized ATR', pane: 'oscillator' },
	{ value: 'ao', label: 'Awesome Oscillator', pane: 'oscillator' },
	{ value: 'apo', label: 'Absolute Price Oscillator', pane: 'oscillator' },
	{ value: 'ppo', label: 'Percentage Price Oscillator', pane: 'oscillator' },
	{ value: 'roc', label: 'Rate of Change', pane: 'oscillator' },
	{ value: 'momentum', label: 'Momentum', pane: 'oscillator' },
	{ value: 'cmo', label: 'Chande Momentum', pane: 'oscillator' },
	{ value: 'trix', label: 'TRIX', pane: 'oscillator' },
	{ value: 'williamsr', label: 'Williams %R', pane: 'oscillator' },
	{ value: 'mfi', label: 'Money Flow Index', pane: 'oscillator', needsVolume: true },
	{ value: 'obv', label: 'On Balance Volume', pane: 'oscillator', needsVolume: true },
	{ value: 'ad', label: 'Accumulation/Distribution', pane: 'oscillator', needsVolume: true },
	{ value: 'cmf', label: 'Chaikin Money Flow', pane: 'oscillator', needsVolume: true },
	{ value: 'chaikin', label: 'Chaikin Oscillator', pane: 'oscillator', needsVolume: true },
	{ value: 'klinger', label: 'Klinger', pane: 'oscillator', needsVolume: true },
	{ value: 'aroon', label: 'Aroon', pane: 'oscillator' },
	{ value: 'aroonoscillator', label: 'Aroon Oscillator', pane: 'oscillator' },
	{ value: 'dmi', label: 'Directional Movement Index', pane: 'oscillator' },
	{ value: 'dpo', label: 'Detrended Price Oscillator', pane: 'oscillator' },
	{ value: 'disparityindex', label: 'Disparity Index', pane: 'oscillator' },
	{ value: 'linearRegressionAngle', label: 'Linear Regression Angle', pane: 'oscillator' },
	{ value: 'linearRegressionIntercept', label: 'Linear Regression Intercept', pane: 'oscillator' },
	{ value: 'linearRegressionSlope', label: 'Linear Regression Slope', pane: 'oscillator' }
];

export const chartIndicators: ChartIndicator[] = chartIndicatorList.map((indicator) =>
	indicator.defaultParams ? indicator : { ...indicator, defaultParams: { period: 14 } }
);

export const overlayIndicators = chartIndicators.filter(
	(indicator) => indicator.pane === 'overlay'
);
export const oscillatorIndicators = chartIndicators.filter(
	(indicator) => indicator.pane === 'oscillator'
);

export type ChartOverlayKey = (typeof overlayIndicators)[number]['value'];
export type ChartOscillatorKey = (typeof oscillatorIndicators)[number]['value'];

export const chartOverlays = [{ value: 'none', label: 'None' }, ...overlayIndicators];
export const chartOscillators = [{ value: 'none', label: 'None' }, ...oscillatorIndicators];

/** Derived from chartIntervals so Gecko mappings cannot drift from the table. */
export const geckoIntervalMap: Partial<Record<IntervalKey, NonNullable<IntervalSpec['gecko']>>> =
	Object.fromEntries(
		Object.entries(chartIntervals).flatMap(([key, spec]) => (spec.gecko ? [[key, spec.gecko]] : []))
	);

export function isIntervalKey(value: string | undefined): value is IntervalKey {
	return !!value && Object.prototype.hasOwnProperty.call(chartIntervals, value);
}

export function isCurrencyKey(value: string | undefined): value is CurrencyKey {
	return !!value && Object.prototype.hasOwnProperty.call(currencyList, value);
}

export function formatStringList(list: string[]): string {
	if (list.length == 1) {
		return list[0];
	} else if (list.length == 2) {
		return `${list[0]} and ${list[1]}`;
	} else if (list.length > 2) {
		return list.slice(0, -1).join(', ') + `, and ${list[list.length - 1]}`;
	}
	return 'Unknown';
}
