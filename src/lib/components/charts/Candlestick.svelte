<script lang="ts">
	import '@awesome.me/webawesome/dist/components/select/select.js';
	import Highcharts, { type Options } from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import Sonification from 'highcharts/modules/sonification';
	import Annotations from 'highcharts/modules/annotations';
	import Indicators from 'highcharts/indicators/indicators-all';
	import { onMount } from 'svelte';
	import {
		type CurrencyKey,
		currencyList,
		chartOverlays,
		type ChartOverlayKey,
		chartOscillators,
		type ChartOscillatorKey
	} from '$lib/utils/common';

	export type CandlestickData = Array<{
		x: number;
		open: number;
		high: number;
		low: number;
		close: number;
	}>;

	export type CandlestickOptions = {
		name: string;
		symbol: string;
		currency: CurrencyKey;
		time: string;
	};

	let candleStickOptions: Highcharts.Options | undefined = $state(undefined);
	let currentOverlay: string = $state('none');
	let currentOscillator: string = $state('none');

	interface Props {
		data: CandlestickData;
		options: CandlestickOptions;
	}

	let { data, options }: Props = $props();

	let currentSeriesOverlay: {
		type: ChartOverlayKey;
		linkedTo: string;
		name: string;
		visible: boolean;
		yAxis: number;
		params: {
			period: number;
		};
	} = $derived.by(() => {
		return {
			type: currentOverlay,
			linkedTo: options.symbol,
			name: currentOverlay,
			visible: currentOverlay !== 'none',
			yAxis: 0,
			params: {
				period: 14
			}
		};
	});
	let currentSeriesOscillator: {
		type: ChartOscillatorKey;
		linkedTo: string;
		name: string;
		visible: boolean;
		yAxis: number;
		params: {
			period: number;
		};
	} = $derived.by(() => ({
		type: currentOscillator,
		linkedTo: options.symbol,
		name: currentOscillator,
		visible: currentOscillator !== 'none',
		yAxis: 1,
		params: {
			period: 14
		}
	}));

	onMount(() => {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);
		Sonification(Highcharts);
		Annotations(Highcharts);
		Indicators(Highcharts);
	});

	$effect(() => {
		if (options) {
			// Ensure data is in the correct format for Highcharts
			candleStickOptions = {
				title: {
					text: `${options.name} (${options.symbol}) Price`
				},
				subtitle: {
					text: `Price in ${currencyList[options.currency].text} as of ${options.time}`
				},
				accessibility: {
					enabled: true,
					// Provide a summary for the chart
					description: `${options.name} (${options.symbol}) candlestick chart showing price movements over time.`,
					// Announce new data when the chart updates
					announceNewData: {
						enabled: true,
						minAnnounceInterval: 5000, // ms between announcements
						announcementFormatter: function (allSeries, newSeries, newPoint) {
							if (newPoint) {
								const date = new Date(newPoint.x);
								const dateString = date.toLocaleString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								});
								return `New data: On ${dateString}, open ${newPoint.open}, high ${newPoint.high}, low ${newPoint.low}, close ${newPoint.close}`;
							}
							return false;
						}
					},
					// Keyboard navigation options
					keyboardNavigation: {
						enabled: true
					},
					point: {
						descriptionFormatter: function (point) {
							const date = new Date(point.x);
							const dateString = date.toLocaleString(undefined, {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							});
							return `${dateString}, open ${point.open}, high ${point.high}, low ${point.low}, close ${point.close}`;
						}
					},
					series: {
						descriptionFormatter: function (series) {
							return `This series shows the price movement of ${options.name} as candlesticks over time.`;
						}
					}
				},
				series: [
					{
						type: 'candlestick',
						id: options.symbol,
						name: options.name,
						data: data
					},
					...(currentOverlay === 'none'
						? []
						: [currentSeriesOverlay as Highcharts.SeriesOptionsType])
				]
			};
		} else {
			candleStickOptions = undefined;
		}
	});
</script>

{#if candleStickOptions}
	<h3>Chart Options</h3>
	<div>
		<wa-select
			label="Overlays"
			value={currentOverlay}
			onchange={(e) => (currentOverlay = e.detail.value)}
		>
			{#each chartOverlays as overlay}
				<wa-option value={overlay.value}>{overlay.label}</wa-option>
			{/each}
		</wa-select>
		<wa-select
			label="Oscillators"
			value={currentOscillator}
			onchange={(e) => (currentOscillator = e.detail.value)}
		>
			{#each chartOscillators as oscillator}
				<wa-option value={oscillator.value}>{oscillator.label}</wa-option>
			{/each}
		</wa-select>
	</div>
	<StockChart options={candleStickOptions} highcharts={Highcharts} />
{/if}
