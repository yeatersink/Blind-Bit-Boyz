<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import {
		type IntervalKey,
		dataIntervalsList,
		type CurrencyKey,
		currencyList
	} from '$lib/utils/common.js';
	import Candlestick, {
		type CandlestickOptions,
		type CandlestickData
	} from '$lib/components/charts/Candlestick.svelte';
	import Line, { type LineOptions, type LineData } from '$lib/components/charts/Line.svelte';

	type ChartKeyType = 'candlestick' | 'line';
	let chartType: Record<ChartKeyType, string> = $state({
		candlestick: 'Candlestick',
		line: 'Line'
	});
	let currentChartType: ChartKeyType = $state('candlestick');
	let currentInterval: IntervalKey = $state('1h');
	let currentStartDate: string = $state(
		new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('.')[0]
	);
	let currentEndDate: string = $state(new Date().toISOString().split('.')[0]);
	let currentCurrency: CurrencyKey = $state('usd');
	let time: string | undefined = $state(undefined);
	let chartDataArray: CandlestickData | LineData = $state([]);
	let chartOptions: CandlestickOptions | LineOptions | undefined = $state(undefined);

	interface Props {
		address: string;
		name: string;
		symbol: string;
	}

	let { address, name, symbol }: Props = $props();

	onMount(() => {
		changeChartType();
	});

	function changeChartType() {
		if (dev) {
			console.log('Changing chart type to', currentChartType);
		}

		chartDataArray = [];
		chartOptions = undefined;
		if (currentChartType == 'candlestick') {
			generateCandleStickChart();
		} else if (currentChartType === 'line') {
			generateLineChart();
		}
	}

	$effect(() => {
		if (dev) {
			console.log('Current Chart Type:', currentChartType);
		}
		changeChartType();
	});

	async function getChartData(type: ChartKeyType) {
		time = undefined;
		const chain = page.url.searchParams.get('chain') || undefined;
		const url = `/api/pair/getCandleStickData?address=${address}${chain ? '&chain=' + chain : ''}&interval=${currentInterval}&startDate=${currentStartDate}&endDate=${currentEndDate}&currency=${currentCurrency}`;
		const result = await fetch(url, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});
		if (result.ok) {
			const candleStickData = await result.json();
			time = result.headers.get('date') || new Date().toISOString();
			if (dev) {
				console.log('Result', candleStickData);
			}
			if (dev) {
				console.log('Chart Type:', type);
			}
			for (let item of candleStickData.result) {
				if (type === 'candlestick') {
					chartDataArray.push({
						x: new Date(item.timestamp).getTime(),
						open: item.open,
						high: item.high,
						low: item.low,
						close: item.close
					});
				} else if (type === 'line') {
					chartDataArray.push({
						x: new Date(item.timestamp).getTime(),
						y: item.close
					});
				}
			}
			if (dev) {
				console.log('Data Array:', chartDataArray);
			}
		} else {
			console.error('Failed to fetch candlestick data:', result.statusText);
		}
	}

	async function generateCandleStickChart() {
		await getChartData('candlestick');
		chartOptions = {
			name: name,
			symbol: symbol,
			currency: currentCurrency,
			time: time || new Date().toISOString()
		};
	}

	async function generateLineChart() {
		await getChartData('line');
		chartOptions = {
			name: name,
			symbol: symbol,
			currency: currentCurrency,
			time: time || new Date().toISOString()
		};
	}
</script>

<fieldset>
	<legend>Chart Type</legend>
	{#each Object.entries(chartType) as [key, value]}
		<label>
			<input type="radio" name="chart-type" value={key} bind:group={currentChartType} />
			{value}
		</label>
	{/each}
</fieldset>

<div>
	<label for="interval">Interval</label>
	<select id="interval" bind:value={currentInterval}>
		{#each Object.entries(dataIntervalsList) as [key, value]}
			<option value={key}>{value.text}</option>
		{/each}
	</select>
</div>
<div>
	<label for="start-date">Start Date</label>
	<input type="datetime-local" id="start-date" bind:value={currentStartDate} max={currentEndDate} />
</div>
<div>
	<label for="end-date">End Date</label>
	<input
		type="datetime-local"
		id="end-date"
		bind:value={currentEndDate}
		min={currentStartDate}
		max={new Date().toISOString().split('.')[0]}
	/>
</div>
<div>
	<label for="currency">Currency</label>
	<select id="currency" bind:value={currentCurrency}>
		{#each Object.entries(currencyList) as [key, value]}
			<option value={key}>{value.text}</option>
		{/each}
	</select>
</div>
<button
	onclick={() => {
		chartDataArray = [];
		chartOptions = undefined;
		generateCandleStickChart();
	}}
>
	Generate Chart
</button>

{#if chartOptions && chartDataArray.length > 0 && currentChartType === 'candlestick'}
	<Candlestick options={chartOptions} data={chartDataArray} />
{:else if chartOptions && chartDataArray.length > 0 && currentChartType === 'line'}
	<Line options={chartOptions} data={chartDataArray} />
{:else}
	<p>No data available for the selected parameters.</p>
{/if}
