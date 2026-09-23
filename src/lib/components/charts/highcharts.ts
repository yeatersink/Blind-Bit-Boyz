import HighchartsImport from 'highcharts/highstock';
import { rangeButtons, type CandleGrouping } from '$lib/utils/timeWindow';
import Accessibility from 'highcharts/modules/accessibility';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Sonification from 'highcharts/modules/sonification';
import Annotations from 'highcharts/modules/annotations';
import Indicators from 'highcharts/indicators/indicators-all';

// The browser build is the Highcharts object. A Node/Vite SSR import is the factory,
// because the UMD wrapper only constructs Highcharts when `document` exists.
// Calling that factory during SSR throws (no DOM). Construct it in the browser only.
const Highcharts =
	typeof window === 'undefined'
		? HighchartsImport
		: typeof HighchartsImport === 'function'
			? (HighchartsImport as (win: Window) => typeof HighchartsImport)(window)
			: HighchartsImport;

function applyModule(mod: unknown) {
	const wrapped = mod as { default?: unknown };
	const factory = typeof mod === 'function' ? mod : wrapped?.default;
	if (typeof factory === 'function') {
		factory(Highcharts);
	}
}

if (typeof window !== 'undefined') {
	// datetime-local uses the browser's local clock. Keep axis labels on that same clock.
	Highcharts.setOptions({ time: { useUTC: false } });
	applyModule(Exporting);
	applyModule(ExportData);
	applyModule(Accessibility);
	applyModule(Sonification);
	applyModule(Annotations);
	applyModule(Indicators);
}

export function speakNumber(value: number | null | undefined): string {
	if (typeof value !== 'number' || !Number.isFinite(value)) return 'unavailable';
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value);
}

export function speakTime(value: number): string {
	return new Date(value).toLocaleString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function indicatorName(
	list: Array<{ value: string; label: string }>,
	value: string
): string {
	return list.find((item) => item.value === value)?.label ?? value;
}

/** Presets in Highcharts 11.4.8 sonification. Violin, bell, harp, and drums are not in this build. */
export const sonificationInstruments = [
	'piano',
	'flute',
	'saxophone',
	'trumpet',
	'vibraphone',
	'plucked',
	'sine',
	'square',
	'sawtooth',
	'triangle',
	'wind',
	'lead',
	'chord'
] as const;

const registeredIndicators = new Set([
	'sma',
	'ema',
	'dema',
	'tema',
	'wma',
	'vwap',
	'bb',
	'abands',
	'keltnerchannels',
	'priceenvelopes',
	'pc',
	'psar',
	'supertrend',
	'pivotpoints',
	'ikh',
	'linearRegression',
	'trendline',
	'zigzag',
	'vbp',
	'rsi',
	'macd',
	'stochastic',
	'slowstochastic',
	'cci',
	'atr',
	'natr',
	'ao',
	'apo',
	'ppo',
	'roc',
	'momentum',
	'cmo',
	'trix',
	'williamsr',
	'mfi',
	'obv',
	'ad',
	'cmf',
	'chaikin',
	'klinger',
	'aroon',
	'aroonoscillator',
	'dmi',
	'dpo',
	'disparityindex',
	'linearRegressionAngle',
	'linearRegressionIntercept',
	'linearRegressionSlope'
]);

let missingIndicatorLogged = false;

export type ActiveIndicator = {
	value: string;
	label: string;
	pane: 'overlay' | 'oscillator';
	needsVolume?: boolean;
	defaultParams?: Record<string, number>;
	instrument: string;
	muted: boolean;
};

function pitchMapping(mapTo: 'close' | 'y') {
	return {
		time: 'x',
		pitch: {
			mapTo,
			within: 'series',
			min: 'c3',
			max: 'c6'
		}
	};
}

export function buildPriceChartOptions(args: {
	seriesType: 'candlestick' | 'line';
	candles: Array<{
		timestamp: number;
		open: number;
		high: number;
		low: number;
		close: number;
		volume?: number;
	}>;
	name: string;
	symbol: string;
	currencyText: string;
	time: string;
	indicators: ActiveIndicator[];
	priceInstrument: string;
	duration: number;
	order: 'sequential' | 'simultaneous';
	grouping: CandleGrouping | null;
	onShowLast: (key: string) => void;
	describePoint: (point: Highcharts.Point) => string;
	describeNewPoint?: (point: Highcharts.Point) => string | false;
}): Highcharts.Options {
	const overlays = args.indicators.filter((indicator) => indicator.pane === 'overlay');
	const oscillators = args.indicators.filter((indicator) => indicator.pane === 'oscillator');
	const priceHeight =
		oscillators.length === 0
			? '100%'
			: oscillators.length === 1
				? '62%'
				: oscillators.length === 2
					? '48%'
					: '55%';
	const yAxis: Highcharts.YAxisOptions[] = [
		{ title: { text: 'Price' }, height: priceHeight, lineWidth: 1 }
	];
	if (oscillators.length === 1) {
		yAxis.push({
			title: { text: oscillators[0].label },
			top: '68%',
			height: '30%',
			offset: 0,
			lineWidth: 1
		});
	} else if (oscillators.length === 2) {
		yAxis.push(
			{
				title: { text: oscillators[0].label },
				top: '54%',
				height: '20%',
				offset: 0,
				lineWidth: 1
			},
			{
				title: { text: oscillators[1].label },
				top: '78%',
				height: '20%',
				offset: 0,
				lineWidth: 1
			}
		);
	} else if (oscillators.length > 2) {
		yAxis.push({
			title: { text: 'Oscillators' },
			top: '62%',
			height: '36%',
			offset: 0,
			lineWidth: 1
		});
	}

	const hasVolume = args.candles.some((candle) => Number.isFinite(candle.volume));
	const needsVolumeSeries = args.indicators.some((indicator) => indicator.needsVolume) && hasVolume;
	if (needsVolumeSeries) {
		yAxis.push({ visible: false, height: 0, top: '100%' });
	}

	const groupingOptions: Highcharts.DataGroupingOptionsObject = args.grouping
		? {
				enabled: true,
				forced: true,
				approximation: args.seriesType === 'candlestick' ? 'ohlc' : 'average',
				units: [[args.grouping.unit, [args.grouping.count]]]
			}
		: { enabled: false };

	const series: Highcharts.SeriesOptionsType[] = [
		args.seriesType === 'candlestick'
			? {
					type: 'candlestick',
					id: 'price',
					name: `${args.name} price`,
					dataGrouping: groupingOptions,
					data: args.candles.map(
						(candle) =>
							[candle.timestamp, candle.open, candle.high, candle.low, candle.close] as [
								number,
								number,
								number,
								number,
								number
							]
					),
					sonification: {
						enabled: true,
						tracks: [
							{
								type: 'instrument',
								instrument: args.priceInstrument,
								mapping: pitchMapping('close')
							}
						]
					}
				}
			: {
					type: 'line',
					id: 'price',
					name: `${args.name} price`,
					dataGrouping: groupingOptions,
					data: args.candles.map((candle) => ({ x: candle.timestamp, y: candle.close })),
					sonification: {
						enabled: true,
						tracks: [
							{
								type: 'instrument',
								instrument: args.priceInstrument,
								mapping: pitchMapping('y')
							}
						]
					}
				}
	];

	if (needsVolumeSeries) {
		series.push({
			type: 'column',
			id: 'volume',
			name: 'Volume',
			data: args.candles
				.filter((candle) => Number.isFinite(candle.volume))
				.map((candle) => [candle.timestamp, candle.volume as number]),
			yAxis: yAxis.length - 1,
			showInLegend: false,
			enableMouseTracking: false,
			sonification: { enabled: false }
		} as Highcharts.SeriesOptionsType);
	}

	let oscillatorIndex = 0;
	for (const indicator of args.indicators) {
		if (!registeredIndicators.has(indicator.value)) {
			if (!missingIndicatorLogged) {
				console.warn(`Skipping unknown Highcharts indicator type: ${indicator.value}`);
				missingIndicatorLogged = true;
			}
			continue;
		}
		const yAxisIndex =
			indicator.pane === 'overlay' ? 0 : oscillators.length <= 2 ? ++oscillatorIndex : 1;
		series.push({
			type: indicator.value,
			id: `ind-${indicator.value}`,
			name: indicator.label,
			linkedTo: 'price',
			yAxis: yAxisIndex,
			showInLegend: true,
			params: {
				...(indicator.defaultParams ?? { period: 14 }),
				...(indicator.needsVolume ? { volumeSeriesID: 'volume' } : {})
			},
			sonification: {
				enabled: !indicator.muted,
				tracks: [
					{
						type: 'instrument',
						instrument: indicator.instrument,
						mapping: pitchMapping('y')
					}
				]
			}
		} as Highcharts.SeriesOptionsType);
	}

	return {
		chart: { height: 560 },
		time: { useUTC: false },
		navigator: { enabled: true },
		plotOptions: {
			series: {
				dataGrouping: { enabled: false }
			}
		},
		rangeSelector: {
			enabled: true,
			allButtonsEnabled: true,
			inputEnabled: false,
			dropdown: 'responsive',
			inputDateFormat: '%Y-%m-%d %H:%M',
			inputEditDateFormat: '%Y-%m-%d %H:%M',
			buttons: rangeButtons.map((button) => ({
				type: button.type,
				count: button.count,
				text: button.text,
				title: button.title,
				events: {
					click: () => {
						args.onShowLast(button.showLast);
						return false;
					}
				}
			}))
		},
		exporting: {
			enabled: true,
			filename: `${args.symbol || args.name || 'price'}-chart`
		},
		annotations: [],
		title: { text: `${args.name} price chart` },
		subtitle: { text: `Price in ${args.currencyText} as of ${args.time}` },
		xAxis: { type: 'datetime' },
		yAxis,
		accessibility: {
			enabled: true,
			description: `${args.name} price chart`,
			keyboardNavigation: { enabled: true },
			announceNewData: args.describeNewPoint
				? {
						enabled: true,
						minAnnounceInterval: 5000,
						announcementFormatter: function (_allSeries, _newSeries, newPoint) {
							return newPoint ? args.describeNewPoint?.(newPoint) || false : false;
						}
					}
				: { enabled: false },
			point: {
				descriptionFormatter: args.describePoint
			},
			series: {
				descriptionFormatter: function (series) {
					return `${series.name} on the ${args.name} price chart.`;
				}
			}
		},
		sonification: {
			enabled: true,
			duration: args.duration,
			order: args.order,
			masterVolume: 0.5,
			showTooltip: false,
			globalTracks:
				args.order === 'sequential'
					? [
							{
								type: 'speech',
								mapping: {
									text: '{point.series.name}',
									volume: 0.4
								},
								activeWhen: function (event: { point?: Highcharts.Point }) {
									return !!event.point && event.point.index === 0;
								}
							}
						]
					: []
		},
		series
	};
}

export default Highcharts;
