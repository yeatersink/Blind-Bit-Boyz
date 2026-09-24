import { parseTimestamp } from '$lib/utils/candles';
import {
	chartIntervals,
	GECKO_CANDLE_CAP,
	GECKO_MAX_CANDLES,
	HISTORY_FALLBACK,
	NEED_LONGER_WINDOW,
	type ChartDataVendor,
	type IntervalKey
} from '$lib/utils/common';

export type GroupUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';

export type CandleGrouping = {
	unit: GroupUnit;
	count: number;
	sentence: string;
};

export type CandleSizeKey =
	| '1m'
	| '5m'
	| '10m'
	| '15m'
	| '30m'
	| '45m'
	| '60m'
	| '1h'
	| '2h'
	| '3h'
	| '6h'
	| '9h'
	| '12h'
	| '18h'
	| '24h'
	| '1d'
	| '2d'
	| '3d'
	| '7d'
	| '14d'
	| '21d'
	| '1mo'
	| '3mo'
	| '6mo'
	| '9mo'
	| '12mo'
	| '1y'
	| '2y'
	| '3y'
	| '6y'
	| '9y'
	| '10y';

export type ShowLastKey = CandleSizeKey | 'beginning';

type Span = { ms: number } | { months: number } | { years: number };

type GroupFallback = {
	fetch: IntervalKey;
	unit: GroupUnit;
	count: number;
	baseLabel: string;
	groupLabel: string;
};

type CandleSize = {
	key: CandleSizeKey;
	label: string;
	bar: Span;
	moralis: IntervalKey | null;
	gecko: IntervalKey | null;
	group: GroupFallback | null;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function size(
	key: CandleSizeKey,
	label: string,
	bar: Span,
	moralis: IntervalKey | null,
	gecko: IntervalKey | null,
	group: GroupFallback | null = null
): CandleSize {
	return { key, label, bar, moralis, gecko, group };
}

function groupOf(
	fetch: IntervalKey,
	unit: GroupUnit,
	count: number,
	baseLabel: string,
	groupLabel: string
): GroupFallback {
	return { fetch, unit, count, baseLabel, groupLabel };
}

/** Candle-size list. Native vendor keys are null when that source cannot serve the bar. */
export const candleSizes: CandleSize[] = [
	size('1m', '1 minute', { ms: MINUTE }, '1min', '1min'),
	size('5m', '5 minute', { ms: 5 * MINUTE }, '5min', '5min'),
	size('10m', '10 minute', { ms: 10 * MINUTE }, '10min', null),
	size('15m', '15 minute', { ms: 15 * MINUTE }, null, '15min'),
	size('30m', '30 minute', { ms: 30 * MINUTE }, '30min', null),
	size(
		'45m',
		'45 minute',
		{ ms: 45 * MINUTE },
		null,
		null,
		groupOf('15min', 'minute', 45, '15-minute', '45-minute')
	),
	size('60m', '60 minute', { ms: HOUR }, '1h', '1h'),
	size('1h', '1 hour', { ms: HOUR }, '1h', '1h'),
	size('2h', '2 hour', { ms: 2 * HOUR }, null, null, groupOf('1h', 'hour', 2, '1-hour', '2-hour')),
	size('3h', '3 hour', { ms: 3 * HOUR }, null, null, groupOf('1h', 'hour', 3, '1-hour', '3-hour')),
	size('6h', '6 hour', { ms: 6 * HOUR }, null, null, groupOf('1h', 'hour', 6, '1-hour', '6-hour')),
	size('9h', '9 hour', { ms: 9 * HOUR }, null, null, groupOf('1h', 'hour', 9, '1-hour', '9-hour')),
	size('12h', '12 hour', { ms: 12 * HOUR }, '12h', '12h'),
	size(
		'18h',
		'18 hour',
		{ ms: 18 * HOUR },
		null,
		null,
		groupOf('1h', 'hour', 18, '1-hour', '18-hour')
	),
	size('24h', '24 hour', { ms: DAY }, '1d', '1d'),
	size('1d', '1 day', { ms: DAY }, '1d', '1d'),
	size('2d', '2 day', { ms: 2 * DAY }, null, null, groupOf('1d', 'day', 2, '1-day', '2-day')),
	size('3d', '3 day', { ms: 3 * DAY }, null, null, groupOf('1d', 'day', 3, '1-day', '3-day')),
	size('7d', '7 day', { ms: 7 * DAY }, '1w', null),
	size('14d', '14 day', { ms: 14 * DAY }, null, null, groupOf('1d', 'day', 14, '1-day', '14-day')),
	size('21d', '21 day', { ms: 21 * DAY }, null, null, groupOf('1d', 'day', 21, '1-day', '21-day')),
	size('1mo', '1 month', { months: 1 }, '1M', null),
	size('3mo', '3 month', { months: 3 }, null, null, groupOf('1d', 'month', 3, '1-day', '3-month')),
	size('6mo', '6 month', { months: 6 }, null, null, groupOf('1d', 'month', 6, '1-day', '6-month')),
	size('9mo', '9 month', { months: 9 }, null, null, groupOf('1d', 'month', 9, '1-day', '9-month')),
	size(
		'12mo',
		'12 month',
		{ months: 12 },
		null,
		null,
		groupOf('1d', 'month', 12, '1-day', '12-month')
	),
	size('1y', '1 year', { years: 1 }, null, null, groupOf('1d', 'year', 1, '1-day', '1-year')),
	size('2y', '2 year', { years: 2 }, null, null, groupOf('1d', 'year', 2, '1-day', '2-year')),
	size('3y', '3 year', { years: 3 }, null, null, groupOf('1d', 'year', 3, '1-day', '3-year')),
	size('6y', '6 year', { years: 6 }, null, null, groupOf('1d', 'year', 6, '1-day', '6-year')),
	size('9y', '9 year', { years: 9 }, null, null, groupOf('1d', 'year', 9, '1-day', '9-year')),
	size('10y', '10 year', { years: 10 }, null, null, groupOf('1d', 'year', 10, '1-day', '10-year'))
];

export type ShowLastOption = {
	key: ShowLastKey;
	label: string;
};

export const showLastOptions: ShowLastOption[] = [
	...candleSizes.map((item) => ({ key: item.key, label: item.label })),
	{ key: 'beginning', label: 'From the beginning' }
];

export type RangeButton = {
	showLast: ShowLastKey;
	type: 'day' | 'month' | 'year' | 'all';
	count?: number;
	text: string;
	title: string;
};

/** Short Highcharts row. Each button calls the same window fetch as Show last. */
export const rangeButtons: RangeButton[] = [
	{ showLast: '1d', type: 'day', count: 1, text: '1D', title: 'Show last 1 day' },
	{ showLast: '7d', type: 'day', count: 7, text: '1W', title: 'Show last 7 day' },
	{ showLast: '1mo', type: 'month', count: 1, text: '1M', title: 'Show last 1 month' },
	{ showLast: '3mo', type: 'month', count: 3, text: '3M', title: 'Show last 3 month' },
	{ showLast: '1y', type: 'year', count: 1, text: '1Y', title: 'Show last 1 year' },
	{ showLast: 'beginning', type: 'all', text: 'All', title: 'Show from the beginning' }
];

export type CandlePlan =
	| { ok: true; interval: IntervalKey; grouping: CandleGrouping | null; bar: Span }
	| { ok: false; message: string };

function sourceSupports(interval: IntervalKey, source: ChartDataVendor): boolean {
	const spec = chartIntervals[interval];
	return source === 'gecko' ? spec.gecko != null : spec.moralis != null;
}

export function candleSizeByKey(key: string): CandleSize | undefined {
	return candleSizes.find((item) => item.key === key);
}

export function isShowLastKey(value: string): value is ShowLastKey {
	return value === 'beginning' || candleSizes.some((item) => item.key === value);
}

export function candleOptionNote(key: string, source: ChartDataVendor): string | null {
	const plan = resolveCandlePlan(key, source);
	if (plan.ok) return null;
	return source === 'gecko' ? 'not on Gecko Terminal' : 'not on Moralis';
}

export function resolveCandlePlan(key: string, source: ChartDataVendor): CandlePlan {
	const item = candleSizeByKey(key);
	if (!item) return { ok: false, message: 'Choose a candle size.' };
	const native = source === 'gecko' ? item.gecko : item.moralis;
	if (native && sourceSupports(native, source)) {
		return { ok: true, interval: native, grouping: null, bar: item.bar };
	}
	if (item.group && sourceSupports(item.group.fetch, source)) {
		return {
			ok: true,
			interval: item.group.fetch,
			bar: item.bar,
			grouping: {
				unit: item.group.unit,
				count: item.group.count,
				sentence: `Showing ${item.group.groupLabel} groups built from ${item.group.baseLabel} candles.`
			}
		};
	}
	const where = source === 'gecko' ? 'Gecko Terminal' : 'Moralis';
	return { ok: false, message: `${item.label} is not on ${where}.` };
}

export function spanMs(endMs: number, span: Span): number {
	if ('ms' in span) return span.ms;
	const start = new Date(endMs);
	if ('months' in span) start.setMonth(start.getMonth() - span.months);
	else start.setFullYear(start.getFullYear() - span.years);
	return endMs - start.getTime();
}

export function windowForShowLast(
	key: ShowLastKey,
	endMs: number,
	createdAt?: string | number | null
): { startMs: number; note: string | null } {
	if (key === 'beginning') {
		const created = createdAt == null || createdAt === '' ? Number.NaN : parseTimestamp(createdAt);
		if (Number.isFinite(created) && created < endMs) {
			return { startMs: created, note: null };
		}
		const start = new Date(endMs);
		start.setFullYear(start.getFullYear() - 1);
		return { startMs: start.getTime(), note: HISTORY_FALLBACK };
	}
	const item = candleSizeByKey(key);
	const width = item ? spanMs(endMs, item.bar) : DAY;
	return { startMs: endMs - width, note: null };
}

/** Refuse a fetch that cannot produce this bar, or that would page Gecko without a bound. */
export function candleWindowIssue(
	plan: Extract<CandlePlan, { ok: true }>,
	source: ChartDataVendor,
	startMs: number,
	endMs: number
): string | null {
	// Minute truncation on the datetime fields can shave a minute off an exact span.
	const width = spanMs(endMs, plan.bar);
	if (plan.grouping && endMs - startMs + 2 * 60_000 < width) {
		return NEED_LONGER_WINDOW;
	}
	if (source !== 'gecko') return null;
	const intervalMs = chartIntervals[plan.interval].intervalMs;
	if (!intervalMs) return null;
	const needed = Math.ceil((endMs - startMs) / intervalMs);
	if (needed > GECKO_MAX_CANDLES) return GECKO_CANDLE_CAP;
	return null;
}
