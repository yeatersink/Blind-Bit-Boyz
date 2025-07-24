<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import Chart from '$lib/components/charts/Chart.svelte';
	import {
		type IntervalKey,
		dataIntervalsList,
		type CurrencyKey,
		currencyList
	} from '$lib/utils/common.js';
	import { page } from '$app/state';
	import Performance from '$lib/components/panels/Performance.svelte';
	import Links from '$lib/components/panels/Links.svelte';
	import Hero from '$lib/components/panels/Hero.svelte';
	import Health from '$lib/components/panels/Health.svelte';
	import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
	import Pair from '$lib/components/panels/Pair.svelte';

	let intervalsList: Array<string> = ['5min', '1h', '4h', '24h'];

	const { data } = $props();
</script>

<svelte:head>
	{#if data && !data.error}
		<title>{data.data.tokenName}</title>
	{:else}
		<title>Data not available</title>
	{/if}
</svelte:head>

{#if data.data && !data.error}
	<Hero
		name={data.data.tokenName}
		logo={data.data.tokenLogo}
		address={data.data.pairAddress}
		symbol={data.data.tokenSymbol}
		chainId={page.url.searchParams.get('chain')}
		usd={data.data.currentUsdPrice}
		usdChange={data.data.pricePercentChange}
		volumeChange={data.data.totalVolume}
		type="pair"
	/>

	<p>Token address: {data.data.tokenAddress}</p>
	<button onclick={() => navigator.clipboard.writeText(data.data.tokenAddress)}>
		Copy Address</button
	>

	<wa-tab-group>
		<wa-tab panel="overview">Overview</wa-tab>
		<wa-tab panel="technical-analysis">Technical Analysis</wa-tab>

		<wa-tab-panel name="overview">
			<Pair
				baseTokenAddress={data.data.tokenAddress}
				symbol={data.data.tokenSymbol}
				label={data.data.pairLabel}
				pairAddress={data.data.pairAddress}
				chainHexId={page.url.searchParams.get('chain')}
				createdAt={data.data.pairCreated}
			/>

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
			{#if data.data.pricePercentChange}
				<h3>Price Change</h3>
				{#each intervalsList as interval}
					{#if data.data.pricePercentChange[interval]}
						<p>{interval}: {data.data.pricePercentChange[interval]}%</p>
					{/if}
				{/each}
			{/if}

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
		</wa-tab-panel>

		<wa-tab-panel name="technical-analysis">
			<h2>Technical Analysis</h2>
			<p>You can change any of the below options to change the data displayed in the charts.</p>
			<Chart
				address={data.data.pairAddress}
				name={data.data.tokenName}
				symbol={data.data.tokenSymbol}
			/>
		</wa-tab-panel>
	</wa-tab-group>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that pair is not available. Please make sure you entered a pair address and selected
		the correct chain.
	</p>
{/if}
