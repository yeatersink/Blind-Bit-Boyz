<script lang="ts">
	// import * as Highcharts from 'highcharts';
	// import 'highcharts/modules/exporting';
	// import { Chart } from '@highcharts/svelte';

	// let options = {
	// 	chart: {
	// 		type: 'line'
	// 	},
	// 	title: {
	// 		text: 'My Chart'
	// 	},
	// 	series: [
	// 		{
	// 			data: [1, 2, 3, 4, 5]
	// 		}
	// 	]
	// };

	const { data } = $props();
</script>

<!-- <Chart {options} highcharts={Highcharts} /> -->

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
