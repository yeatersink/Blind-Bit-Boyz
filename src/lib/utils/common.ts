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
	| '24h'
	| '1d'
	| '1w'
	| '1M';

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
	'1M': { text: '1 month' }
};

const chartOverlaysList: Array<{ value: string; label: string }> = [
	{ value: 'abands', label: 'Acceleration Bands' },
	{ value: 'bb', label: 'Bollinger Bands' },
	{ value: 'dema', label: 'DEMA (Double Exponential Moving Average)' },
	{ value: 'ema', label: 'EMA (Exponential Moving Average)' },
	{ value: 'ikh', label: 'Ichimoku Kinko Hyo' },
	{ value: 'keltnerchannels', label: 'Keltner Channels' },
	{ value: 'linearRegression', label: 'Linear Regression' },
	{ value: 'pivotpoints', label: 'Pivot Points' },
	{ value: 'pc', label: 'Price Channel' },
	{ value: 'priceenvelopes', label: 'Price Envelopes' },
	{ value: 'psar', label: 'PSAR (Parabolic SAR)' },
	{ value: 'sma', label: 'SMA (Simple Moving Average)' },
	{ value: 'supertrend', label: 'Super Trend' },
	{ value: 'tema', label: 'TEMA (Triple Exponential Moving Average)' },
	{ value: 'vbp', label: 'VbP (Volume by Price)' },
	{ value: 'vwap', label: 'WMA (Weighted Moving Average)' },
	{ value: 'wma', label: 'VWAP (Volume Weighted Average Price)' },
	{ value: 'zigzag', label: 'Zig Zag' }
].sort((a, b) => a.label.localeCompare(b.label));

export type ChartOverlayKey = (typeof chartOverlaysList)[number]['value'];

export const chartOverlays = [{ value: 'none', label: 'None' }, ...chartOverlaysList];

const chartOscillatorsList: Array<{ value: string; label: string }> = [
	{ value: 'apo', label: 'Absolute price indicator' },
	{ value: 'ad', label: 'A/D (Accumulation/Distribution)' },
	{ value: 'aroon', label: 'Aroon' },
	{ value: 'aroonoscillator', label: 'Aroon oscillator' },
	{ value: 'atr', label: 'ATR (Average True Range)' },
	{ value: 'ao', label: 'Awesome oscillator' },
	{ value: 'cci', label: 'CCI (Commodity Channel Index)' },
	{ value: 'chaikin', label: 'Chaikin' },
	{ value: 'cmf', label: 'CMF (Chaikin Money Flow)' },
	{ value: 'disparityindex', label: 'Disparity Index' },
	{ value: 'cmo', label: 'CMO (Chande Momentum Oscillator)' },
	{ value: 'dmi', label: 'DMI (Directional Movement Index)' },
	{ value: 'dpo', label: 'Detrended price' },
	{ value: 'linearRegressionAngle', label: 'Linear Regression Angle' },
	{ value: 'linearRegressionIntercept', label: 'Linear Regression Intercept' },
	{ value: 'linearRegressionSlope', label: 'Linear Regression Slope' },
	{ value: 'klinger', label: 'Klinger Oscillator' },
	{ value: 'macd', label: 'MACD (Moving Average Convergence Divergence)' },
	{ value: 'mfi', label: 'MFI (Money Flow Index)' },
	{ value: 'momentum', label: 'Momentum' },
	{ value: 'natr', label: 'NATR (Normalized Average True Range)' },
	{ value: 'obv', label: 'OBV (On-Balance Volume)' },
	{ value: 'ppo', label: 'Percentage Price oscillator' },
	{ value: 'roc', label: 'RoC (Rate of Change)' },
	{ value: 'rsi', label: 'RSI (Relative Strength Index)' },
	{ value: 'slowstochastic', label: 'Slow Stochastic' },
	{ value: 'stochastic', label: 'Stochastic' },
	{ value: 'trix', label: 'TRIX' },
	{ value: 'williamsr', label: 'Williams %R' }
].sort((a, b) => a.label.localeCompare(b.label));

export type ChartOscillatorKey = (typeof chartOscillatorsList)[number]['value'];

export const chartOscillators = [{ value: 'none', label: 'None' }, ...chartOscillatorsList];

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
