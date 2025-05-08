<script lang="ts">
	import Highcharts from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import { onMount } from 'svelte';

	let options: Highcharts.Options | undefined = $state(undefined);

	onMount(async () => {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);

		const data = await getData();

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
					data: data
				}
			]
		};
	});

	async function getData() {}

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
