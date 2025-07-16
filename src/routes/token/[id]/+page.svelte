<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import {
		type IntervalKey,
		dataIntervalsList,
		type CurrencyKey,
		currencyList
	} from '$lib/utils/common.js';
	import { page } from '$app/state';

	let intervalsList: Array<string> = ['5min', '1h', '4h', '24h'];

	const { data } = $props();
	console.log(data);
</script>

<svelte:head>
	{#if data && !data.error}
		<title>{data.data.token_name}</title>
	{:else}
		<title>Data not available</title>
	{/if}
</svelte:head>

{#if data.data && !data.error}
	<h1>{data.data.token_name}</h1>
	<img src={data.data.token_logo} alt="Token Logo" height="20%" width="20%" />
	<p>Token address: {data.data.token_address}</p>
	<button onclick={() => navigator.clipboard.writeText(data.data.token_address)}>
		Copy Address</button
	>
	<p>Symbol: {data.data.token_symbol}</p>

	<div>
		<h2>Price Info</h2>
		<p>USD: ${data.data.price_usd}</p>
		{#if data.data.price_percent_change_usd}
			<h3>Price Change</h3>
			{#each intervalsList as interval}
				{#if data.data.price_percent_change_usd[interval]}
					<p>{interval}: {data.data.price_percent_change_usd[interval]}%</p>
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
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that token is not available. Please make sure you entered a token address and selected
		the correct chain.
	</p>
{/if}
