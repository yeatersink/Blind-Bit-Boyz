<script lang="ts">
	import { StockChart } from '@highcharts/svelte';
	import Highcharts, {
		buildPriceChartOptions,
		hookChartCsvDownload,
		speakNumber,
		speakTime
	} from './highcharts';
	import { currencyList, type CurrencyKey } from '$lib/utils/common';
	import type { Candle } from '$lib/utils/candles';
	import type { ActiveIndicator } from './highcharts';
	import type { CandleGrouping } from '$lib/utils/timeWindow';

	export type LineOptions = {
		name: string;
		symbol: string;
		currency: CurrencyKey;
		time: string;
	};

	interface Props {
		candles: Candle[];
		options: LineOptions;
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

	let lineOptions = $derived.by(() =>
		buildPriceChartOptions({
			seriesType: 'line',
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
			describePoint: (point) => `${speakTime(point.x)}, price ${speakNumber(point.y)}`
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
	<StockChart options={lineOptions} highcharts={Highcharts} callback={rememberChart} />
</div>

<style>
	.chart-frame {
		height: 560px;
		min-height: 560px;
	}
</style>
