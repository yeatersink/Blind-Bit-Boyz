<script lang="ts">
	import { StockChart } from '@highcharts/svelte';
	import Highcharts, {
		buildPriceChartOptions,
		hookChartCsvDownload,
		priceChartUsesOhlc,
		speakNumber,
		speakTime,
		type PriceChartType
	} from './highcharts';
	import { currencyList, type CurrencyKey } from '$lib/utils/common';
	import type { Candle } from '$lib/utils/candles';
	import type { ActiveIndicator } from './highcharts';
	import type { CandleGrouping } from '$lib/utils/timeWindow';

	export type CandlestickOptions = {
		name: string;
		symbol: string;
		currency: CurrencyKey;
		time: string;
	};

	interface Props {
		candles: Candle[];
		seriesType: PriceChartType;
		options: CandlestickOptions;
		indicators: ActiveIndicator[];
		priceInstrument: string;
		duration: number;
		order: 'sequential' | 'simultaneous';
		grouping: CandleGrouping | null;
		onShowLast: (key: string) => void;
		onCsvDownload: () => void;
		chart?: Highcharts.Chart | null;
	}

	let {
		candles,
		seriesType,
		options,
		indicators,
		priceInstrument,
		duration,
		order,
		grouping,
		onShowLast,
		onCsvDownload,
		chart = $bindable(null)
	}: Props = $props();

	let candleStickOptions = $derived.by(() =>
		buildPriceChartOptions({
			seriesType,
			candles,
			name: options.name,
			symbol: options.symbol,
			currencyText: currencyList[options.currency].text,
			time: options.time,
			indicators,
			priceInstrument,
			duration,
			order,
			grouping,
			onShowLast,
			describePoint: (point) => {
				const candle = point as Highcharts.Point & {
					open?: number;
					high?: number;
					low?: number;
					close?: number;
				};
				if (priceChartUsesOhlc(seriesType)) {
					return `${speakTime(candle.x)}, open ${speakNumber(candle.open)}, high ${speakNumber(candle.high)}, low ${speakNumber(candle.low)}, close ${speakNumber(candle.close)}`;
				}
				const close = typeof candle.close === 'number' ? candle.close : candle.y;
				return `${speakTime(candle.x)}, price ${speakNumber(close)}`;
			},
			describeNewPoint: priceChartUsesOhlc(seriesType)
				? (point) => {
						const candle = point as Highcharts.Point & {
							open?: number;
							high?: number;
							low?: number;
							close?: number;
						};
						return `New data: On ${speakTime(candle.x)}, open ${speakNumber(candle.open)}, high ${speakNumber(candle.high)}, low ${speakNumber(candle.low)}, close ${speakNumber(candle.close)}`;
					}
				: undefined
		})
	);

	function rememberChart(instance: Highcharts.Chart) {
		chart = instance;
		hookChartCsvDownload(instance, onCsvDownload);
		for (const series of instance.series) {
			const id = String(series.options.id ?? '');
			if (id !== 'price' && id !== 'volume' && !id.startsWith('ind-')) {
				series.update({ sonification: { enabled: false } } as Highcharts.SeriesOptionsType, false);
			}
		}
	}
</script>

<div class="chart-frame">
	<StockChart options={candleStickOptions} highcharts={Highcharts} callback={rememberChart} />
</div>

<style>
	.chart-frame {
		height: 560px;
		min-height: 560px;
	}
</style>
