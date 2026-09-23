<script lang="ts">
	import { StockChart } from '@highcharts/svelte';
	import Highcharts, { buildPriceChartOptions, speakNumber, speakTime } from './highcharts';
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
		options: CandlestickOptions;
		indicators: ActiveIndicator[];
		priceInstrument: string;
		duration: number;
		order: 'sequential' | 'simultaneous';
		grouping: CandleGrouping | null;
		onShowLast: (key: string) => void;
		chart?: Highcharts.Chart | null;
	}

	let {
		candles,
		options,
		indicators,
		priceInstrument,
		duration,
		order,
		grouping,
		onShowLast,
		chart = $bindable(null)
	}: Props = $props();

	let candleStickOptions = $derived.by(() =>
		buildPriceChartOptions({
			seriesType: 'candlestick',
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
				return `${speakTime(candle.x)}, open ${speakNumber(candle.open)}, high ${speakNumber(candle.high)}, low ${speakNumber(candle.low)}, close ${speakNumber(candle.close)}`;
			},
			describeNewPoint: (point) => {
				const candle = point as Highcharts.Point & {
					open?: number;
					high?: number;
					low?: number;
					close?: number;
				};
				return `New data: On ${speakTime(candle.x)}, open ${speakNumber(candle.open)}, high ${speakNumber(candle.high)}, low ${speakNumber(candle.low)}, close ${speakNumber(candle.close)}`;
			}
		})
	);

	function rememberChart(instance: Highcharts.Chart) {
		chart = instance;
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
