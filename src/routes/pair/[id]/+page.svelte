<script lang="ts">
	import Highcharts from 'highcharts/highstock';
	import { StockChart } from '@highcharts/svelte';
	import Accessibility from 'highcharts/modules/accessibility';
	import Exporting from 'highcharts/modules/exporting';
	import ExportData from 'highcharts/modules/export-data';
	import Sonification from 'highcharts/modules/sonification';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import {
		type IntervalKey,
		dataIntervalsList,
		type CurrencyKey,
		currencyList
	} from '$lib/utils/common.js';

	let currentTab: 'details' | 'technical-analysis' = $state('details');
	let currentInterval: IntervalKey = $state('1h');
	let currentStartDate: string = $state(
		new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('.')[0]
	);
	let currentEndDate: string = $state(new Date().toISOString().split('.')[0]);
	let currentCurrency: CurrencyKey = $state('usd');
	let intervalsList: Array<string> = ['5min', '1h', '4h', '24h'];
	let candelStickDataArray: Array<{
		x: number;
		open: number;
		high: number;
		low: number;
		close: number;
	}> = $state([]);

	let candleStickOptions: Highcharts.Options | undefined = $state(undefined);

	const { data } = $props();

	$effect(() => {
		if (currentTab === 'technical-analysis') {
			setUpTA();
		}
	});

	function setUpTA() {
		Exporting(Highcharts);
		ExportData(Highcharts);
		Accessibility(Highcharts);
		Sonification(Highcharts);

		if (!candleStickOptions) {
			generateCamndleStickChart();
		}
	}

	async function generateCamndleStickChart() {
		const url = `/api/pair/getCandleStickData?address=${data.data.pairAddress}&interval=${currentInterval}&startDate=${currentStartDate}&endDate=${currentEndDate}&currency=${currentCurrency}`;
		const result = await fetch(url, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});
		if (result.ok) {
			const candleStickData = await result.json();

			if (dev) {
				console.log('Candlestick data', candleStickData);
			}
			for (let item of candleStickData.result) {
				candelStickDataArray.push({
					x: new Date(item.timestamp).getTime(),
					open: item.open,
					high: item.high,
					low: item.low,
					close: item.close
				});
			}
			candleStickOptions = {
				rangeSelector: {
					selected: 1
				},
				title: {
					text: `${data.data.tokenName} (${data.data.tokenSymbol}) Price`
				},
				subtitle: {
					text: `Price in ${currencyList[candleStickData.currency as CurrencyKey].text} as of ${result.headers.get('date')}`
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
			candleStickOptions = {
				title: {
					text: 'No data available'
				}
			};
		}
	}
</script>

<svelte:head>
	{#if data && !data.error}
		<title>{data.data.tokenName}</title>
	{:else}
		<title>Data not available</title>
	{/if}
</svelte:head>

{#if data.data && !data.error}
	<h1>{data.data.tokenName}</h1>
	<img src={data.data.tokenLogo} alt="Token Logo" height="20%" width="20%" />
	<p>Token address: {data.data.tokenAddress}</p>
	<button onclick={() => navigator.clipboard.writeText(data.data.tokenAddress)}>
		Copy Address</button
	>
	<p>Symbol: {data.data.tokenSymbol}</p>

	<div role="tablist">
		<button
			role="tab"
			id="tab-details"
			aria-controls="tabpanel-details"
			aria-selected={currentTab === 'details'}
			tabindex={currentTab === 'details' ? 0 : -1}
			onclick={() => (currentTab = 'details')}
		>
			Details
		</button>
		<button
			role="tab"
			id="tab-technical-analysis"
			aria-controls="tabpanel-technical-analysis"
			aria-selected={currentTab === 'technical-analysis'}
			tabindex={currentTab === 'technical-analysis' ? 0 : -1}
			onclick={() => {
				currentTab = 'technical-analysis';
			}}
		>
			Technical Analysis
		</button>
	</div>
	<div
		role="tabpanel"
		aria-labelledby="tab-details"
		id="tabpanel-details"
		class:hidden={currentTab != 'details'}
		tabindex={currentTab === 'details' ? 0 : -1}
	>
		<h2>Pair Info</h2>
		<p>Created: {data.data.pairCreated}</p>
		<p>Label: {data.data.pairLabel}</p>
		<p>Pair address: {data.data.pairAddress}</p>
		<button onclick={() => navigator.clipboard.writeText(data.data.pairAddress)}>
			Copy Address</button
		>
		<h2>Exchange Info</h2>
		<p>Name: {data.data.exchange}</p>
		<img src={data.data.exchangeLogo} alt="Exchange Logo" height="20%" width="20%" />
		<p>Exchange Address: {data.data.exchangeAddress}</p>
		<button onclick={() => navigator.clipboard.writeText(data.data.exchangeAddress)}>
			Copy Address</button
		>
		<p>URL: {data.data.exchangeUrl}</p>
		<h2>Price Info</h2>
		<p>USD: ${data.data.currentUsdPrice}</p>
		<p>Native: {data.data.currentNativePrice}</p>
		<h3>Price Change</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.pricePercentChange[interval]}%</p>
		{/each}

		<h2>Liquidity</h2>
		<p>Total liquidity USD: {data.data.totalLiquidityUsd}</p>

		<h3>Liquidity Change</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.liquidityPercentChange[interval]}%</p>
		{/each}

		<h2>Transactions</h2>

		<h3>Buys</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.buys[interval]}</p>
		{/each}

		<h3>Sells</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.sells[interval]}</p>
		{/each}

		<h3>buyers</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.buyers[interval]}</p>
		{/each}

		<h3>sellers</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.sellers[interval]}</p>
		{/each}

		<h2>Volume</h2>

		<h3>Total Volume</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.totalVolume[interval]}</p>
		{/each}

		<h3>Buy Volume</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.buyVolume[interval]}</p>
		{/each}

		<h3>Sell Volume</h3>
		{#each intervalsList as interval}
			<p>{interval}: {data.data.sellVolume[interval]}</p>
		{/each}
	</div>
	<div
		role="tabpanel"
		aria-labelledby="tab-technical-analysis"
		id="tabpanel-technical-analysis"
		class:hidden={currentTab != 'technical-analysis'}
		tabindex={currentTab === 'technical-analysis' ? 0 : -1}
	>
		<h2>Technical Analysis</h2>
		<p>You can change any of the below options to change the data displayed in the charts.</p>
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
			<input
				type="datetime-local"
				id="start-date"
				bind:value={currentStartDate}
				max={currentEndDate}
			/>
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
				candelStickDataArray = [];
				candleStickOptions = undefined;
				generateCamndleStickChart();
			}}
		>
			Generate Chart
		</button>
		{#if candleStickOptions}
			<StockChart options={candleStickOptions} highcharts={Highcharts} />
		{/if}
	</div>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that pair is not available. Please make sure you entered a pair address and selected
		the correct chain.
	</p>
{/if}
