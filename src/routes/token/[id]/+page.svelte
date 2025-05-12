<script lang="ts">
	import Highcharts from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import { onMount } from 'svelte';
	let options: Highcharts.Options | undefined = undefined;

	onMount(() => {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);

		const startDate = Date.UTC(2024, 0, 1);
		const interval = 24 * 60 * 60 * 1000; // one point per day

		// Generate random candlestick data
		const randomData = Array.from({ length: 100 }, (_, i) => {
			const timestamp = startDate + i * interval;
			const open = Math.random() * 100 + 100; // Random open price
			const close = open + (Math.random() - 0.5) * 10; // Close price near open
			const high = Math.max(open, close) + Math.random() * 5; // High price
			const low = Math.min(open, close) - Math.random() * 5; // Low price
			return [timestamp, open, high, low, close];
		});

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
					name: 'Random Stock Data',
					data: randomData
				}
			]
		};
	});

	const { data } = $props();
</script>

<svelte:head>
	<title>Candlestick Token Chart Example</title>
</svelte:head>

<h1>chart Example</h1>
{#if options}
	<StockChart {options} highcharts={Highcharts} />
{/if}

{#if data.token}
	{#each data.token as block}
		<h1>{new Date(Number(block.blockTimestamp))}</h1>
		<p>{block.tokenName}</p>
		<p>${block.usdPriceFormatted}</p>
	{/each}
{:else if data.error}
	<h1>Error</h1>
	<p>{data.error}</p>
{:else}
	<h1>Token not found</h1>
	<p>No token data available.</p>
{/if}
