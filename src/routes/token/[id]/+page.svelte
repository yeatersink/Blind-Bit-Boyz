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

	let currentTab: 'details' | 'technical-analysis' = $state('details');
	let intervalsList: Array<string> = ['5min', '1h', '4h', '24h'];

	const { data } = $props();
	console.log(data);
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

		{#if data.data.liquidityPercentChange}
			<h3>Liquidity Change</h3>
			{#each intervalsList as interval}
				{#if data.data.liquidityPercentChange[interval]}
					<p>{interval}: {data.data.liquidityPercentChange[interval]}%</p>
				{/if}
			{/each}
		{/if}
		<h2>Transactions</h2>

		{#if data.data.buys && data.data.buys.length > 0}
			<h3>Buys</h3>
			{#each intervalsList as interval}
				{#if data.data.buys[interval]}
					<p>{interval}: {data.data.buys[interval]}</p>
				{/if}
			{/each}
		{/if}

		{#if data.data.sells && data.data.sells.length > 0}
			<h3>Sells</h3>
			{#each intervalsList as interval}
				{#if data.data.sells[interval]}
					<p>{interval}: {data.data.sells[interval]}</p>
				{/if}
			{/each}
		{/if}

		{#if data.data.buyers && data.data.buyers.length > 0}
			<h3>buyers</h3>
			{#each intervalsList as interval}
				{#if data.data.buyers[interval]}
					<p>{interval}: {data.data.buyers[interval]}</p>
				{/if}
			{/each}
		{/if}

		{#if data.data.sellers && data.data.sellers.length > 0}
			<h3>sellers</h3>
			{#each intervalsList as interval}
				{#if data.data.sellers[interval]}
					<p>{interval}: {data.data.sellers[interval]}</p>
				{/if}
			{/each}
		{/if}

		<h2>Volume</h2>

		{#if data.data.totalVolume && data.data.totalVolume.length > 0}
			<h3>Total Volume</h3>
			{#each intervalsList as interval}
				{#if data.data.totalVolume[interval]}
					<p>{interval}: {data.data.totalVolume[interval]}</p>
				{/if}
			{/each}
		{/if}

		{#if data.data.buyVolume && data.data.buyVolume.length > 0}
			<h3>Buy Volume</h3>
			{#each intervalsList as interval}
				{#if data.data.buyVolume[interval]}
					<p>{interval}: {data.data.buyVolume[interval]}</p>
				{/if}
			{/each}
		{/if}

		{#if data.data.sellVolume && data.data.sellVolume.length > 0}
			<h3>Sell Volume</h3>
			{#each intervalsList as interval}
				{#if data.data.sellVolume[interval]}
					<p>{interval}: {data.data.sellVolume[interval]}</p>
				{/if}
			{/each}
		{/if}
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
		<Chart
			address={data.data.pairAddress}
			name={data.data.tokenName}
			symbol={data.data.tokenSymbol}
		/>
	</div>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that pair is not available. Please make sure you entered a pair address and selected
		the correct chain.
	</p>
{/if}
