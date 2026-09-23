export type ChartDataSource = 'gecko' | 'moralis';

export type Candle = {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
};

export function parseTimestamp(value: unknown): number {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value < 1e12 ? value * 1000 : value;
	}
	if (typeof value === 'string') {
		if (/^\d+$/.test(value)) {
			const numeric = Number(value);
			return numeric < 1e12 ? numeric * 1000 : numeric;
		}
		return Date.parse(value);
	}
	return Number.NaN;
}

export function parseTimeInput(value: string | undefined, fallback: number): number {
	if (!value) return fallback;
	return parseTimestamp(value);
}

export function finiteNumber(value: unknown): number {
	const numeric = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : Number.NaN;
}
