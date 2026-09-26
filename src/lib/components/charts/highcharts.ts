import HighchartsImport from 'highcharts/highstock';
import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
import { rangeButtons, type CandleGrouping } from '$lib/utils/timeWindow';
import Accessibility from 'highcharts/modules/accessibility';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import OfflineExporting from 'highcharts/modules/offline-exporting';
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
	applyModule(OfflineExporting);
	applyModule(Accessibility);
	applyModule(Sonification);
	applyModule(Annotations);
	applyModule(Indicators);
}

export function speakNumber(value: number | null | undefined): string {
	if (typeof value !== 'number' || !Number.isFinite(value)) return 'unavailable';
	return formatCryptoPrice(value);
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

type MenuChart = Highcharts.Chart & {
	exportDivElements?: Array<HTMLElement | null | undefined>;
	exportContextMenu?: HTMLElement & { hideMenu?: () => void };
};

function exportMenuItems(chart: MenuChart): HTMLElement[] {
	return (chart.exportDivElements ?? []).filter(
		(element): element is HTMLElement =>
			!!element && element.tagName === 'LI' && element.classList.contains('highcharts-menu-item')
	);
}

function focusExportMenu(chart: MenuChart) {
	const items = exportMenuItems(chart);
	if (!items.length) return;
	items.forEach((element, index) => {
		element.setAttribute('role', 'menuitem');
		element.tabIndex = index === 0 ? 0 : -1;
	});
	items[0].focus();
	const menu = chart.exportContextMenu;
	if (!menu || menu.dataset.menuKeys === 'on') return;
	menu.dataset.menuKeys = 'on';
	menu.addEventListener('keydown', (event: KeyboardEvent) => {
		const entries = exportMenuItems(chart);
		const index = entries.indexOf(document.activeElement as HTMLElement);
		const move = (step: number) => {
			const next = entries[(Math.max(index, 0) + step + entries.length) % entries.length];
			entries.forEach((element) => {
				element.tabIndex = -1;
			});
			if (!next) return;
			next.tabIndex = 0;
			next.focus();
		};
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			event.preventDefault();
			move(1);
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			event.preventDefault();
			move(-1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			move(-Math.max(index, 0));
		} else if (event.key === 'End') {
			event.preventDefault();
			move(entries.length - 1 - Math.max(index, 0));
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			(document.activeElement as HTMLElement | null)?.click();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			menu.hideMenu?.();
		}
	});
}

export function hookChartCsvDownload(chart: Highcharts.Chart, onCsv: () => void) {
	const exporter = chart as Highcharts.Chart & {
		downloadCSV?: () => void;
		_csvHooked?: boolean;
	};
	if (exporter._csvHooked) return;
	exporter._csvHooked = true;
	const events = Highcharts as unknown as {
		addEvent: (target: Highcharts.Chart, event: string, handler: () => void) => void;
	};
	events.addEvent(chart, 'exportMenuShown', () => {
		queueMicrotask(() => focusExportMenu(chart as MenuChart));
	});
	if (typeof exporter.downloadCSV !== 'function') return;
	const original = exporter.downloadCSV.bind(exporter);
	exporter.downloadCSV = () => {
		original();
		onCsv();
	};
	exporter._csvHooked = true;
}

function microPriceExtent(
	candles: Array<{ open: number; high: number; low: number; close: number }>
): { min: number; max: number } | null {
	if (!candles.length) return null;
	let lowestLow = Infinity;
	let highestHigh = -Infinity;
	for (const candle of candles) {
		const values = [candle.open, candle.high, candle.low, candle.close];
		if (values.some((value) => !Number.isFinite(value) || value <= 0)) return null;
		lowestLow = Math.min(lowestLow, candle.low);
		highestHigh = Math.max(highestHigh, candle.high);
	}
	if (!(highestHigh < 0.01)) return null;
	return { min: lowestLow * 0.98, max: highestHigh * 1.02 };
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
	const priceExtent = microPriceExtent(args.candles);
	const yAxis: Highcharts.YAxisOptions[] = [
		{
			title: { text: 'Price' },
			height: priceHeight,
			lineWidth: 1,
			...(priceExtent
				? {
						min: priceExtent.min,
						max: priceExtent.max,
						startOnTick: false,
						endOnTick: false
					}
				: {}),
			labels: {
				formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
					const value = typeof this.value === 'number' ? this.value : Number(this.value);
					return Number.isFinite(value) ? formatCryptoPrice(value) : String(this.value);
				}
			}
		}
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
			includeInDataExport: false,
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
		lang: {
			contextButtonTitle: 'Chart menu',
			accessibility: {
				exporting: {
					menuButtonLabel: 'Chart menu',
					chartMenuLabel: 'Chart menu'
				}
			}
		},
		exporting: {
			enabled: true,
			fallbackToExportServer: false,
			filename: `${args.symbol || args.name || 'price'}-chart`,
			csv: {
				dateFormat: '%Y-%m-%d %H:%M:%S',
				columnHeaderFormatter(
					item: { coll?: string; name?: string } | null | undefined,
					key?: string
				) {
					if (!item || item.coll === 'xAxis') return 'Date';
					if (key === 'open') return 'Open';
					if (key === 'high') return 'High';
					if (key === 'low') return 'Low';
					if (key === 'close') return 'Close';
					return item.name === 'Volume' ? 'Volume' : item.name || 'Value';
				}
			},
			buttons: {
				contextButton: {
					menuItems: [
						'viewFullscreen',
						'printChart',
						'separator',
						'downloadPNG',
						'downloadJPEG',
						'downloadPDF',
						'downloadSVG',
						'separator',
						'downloadCSV',
						'downloadXLS',
						'viewData'
					]
				}
			}
		},
		annotations: [],
		title: { text: `${args.name} price chart` },
		subtitle: { text: `Price in ${args.currencyText} as of ${args.time}` },
		xAxis: { type: 'datetime' },
		yAxis,
		tooltip: {
			formatter(this: Highcharts.TooltipFormatterContextObject) {
				const point = this.point as Highcharts.Point & {
					open?: number;
					high?: number;
					low?: number;
					close?: number;
				};
				const stamp =
					typeof point.x === 'number' ? Highcharts.dateFormat('%Y-%m-%d %H:%M', point.x) : '';
				if (
					typeof point.open === 'number' &&
					typeof point.high === 'number' &&
					typeof point.low === 'number' &&
					typeof point.close === 'number'
				) {
					return [
						stamp,
						`Open: ${formatCryptoPrice(point.open)}`,
						`High: ${formatCryptoPrice(point.high)}`,
						`Low: ${formatCryptoPrice(point.low)}`,
						`Close: ${formatCryptoPrice(point.close)}`
					].join('<br/>');
				}
				const price = typeof point.y === 'number' ? point.y : Number.NaN;
				return `${stamp}<br/>Price: ${formatCryptoPrice(price)}`;
			}
		},
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
