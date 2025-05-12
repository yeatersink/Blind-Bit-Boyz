<script lang="ts">
	import Highcharts from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import Sonification from 'highcharts/modules/sonification';
	import { onMount } from 'svelte';

	let candelStickDataArray: Array<{
		x: number;
		open: number;
		high: number;
		low: number;
		close: number;
	}> = $state([]);

	let options: Highcharts.Options | undefined = $state(undefined);

	const { data } = $props();

	onMount(async () => {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);
		Sonification(Highcharts);

		if (data.token) {
			for (let result of data.token.result) {
				candelStickDataArray.push({
					x: new Date(result.timestamp).getTime(),
					open: result.open,
					high: result.high,
					low: result.low,
					close: result.close
				});
			}
			options = {
				rangeSelector: {
					selected: 1
				},
				title: {
					text: 'Candlestick Chart Example'
				},
				series: [
					{
						type: 'candlestick',
						data: candelStickDataArray,
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
			options = {
				title: {
					text: 'No data available'
				}
			};
		}
	});
</script>

<svelte:head>
	<title>Candlestick Token Chart Example</title>
</svelte:head>

<h1>chart Example</h1>
{#if options}
	<StockChart {options} highcharts={Highcharts} />
{/if}
