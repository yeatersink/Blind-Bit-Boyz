<script lang="ts">
	import Highcharts from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import Sonification from 'highcharts/modules/sonification';
	import Annotations from 'highcharts/modules/annotations';
	import Indicators from 'highcharts/indicators/indicators-all';
	import { onMount } from 'svelte';
	import { type CurrencyKey, currencyList } from '$lib/utils/common';

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

	interface Props {
		data: CandlestickData;
		options: CandlestickOptions;
	}

	let { data, options }: Props = $props();

	onMount(() => {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);
		Sonification(Highcharts);
		Annotations(Highcharts);
	});

	$effect(() => {
		if (options) {
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
						data: data,
						sonification: {
							enabled: true,
							tracks: [
								{
									instrument: 'piano',
									mapping: {
										pitch: {
											mapTo: 'high',
											min: 'c3',
											max: 'g6'
										},
										volume: '1',
										noteDuration: 300
									}
								}
							]
						}
					}
				]
			};
		} else {
			candleStickOptions = undefined;
		}
	});
</script>

{#if candleStickOptions}
	<StockChart options={candleStickOptions} highcharts={Highcharts} />
{/if}
