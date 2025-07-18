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
	import Price from '$lib/components/panels/Price.svelte';
	import Liquidity from '$lib/components/panels/Liquidity.svelte';
	import Links from '$lib/components/panels/Links.svelte';
	import Hero from '$lib/components/panels/Hero.svelte';
	import Token from '$lib/components/panels/Token.svelte';

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
	<Hero
		name={data.data.token_name}
		symbol={data.data.token_symbol}
		logo={data.data.token_logo}
		usd={data.data.price_usd || null}
		usdChange={data.data.price_percent_change_usd || null}
	/>

	<Token
		address={data.data.token_address}
		symbol={data.data.token_symbol}
		chainHexId={data.data.chain_id}
	/>

	<div>
		<Price
			usd={data.data.price_usd || null}
			native={data.data.price_native || null}
			priceChange={data.data.price_percent_change_usd || null}
		/>
		<Liquidity
			liquidityLockedInPercent={data.data.total_liquidity_locked_in_percent || null}
			liquidityChangeUsd={data.data.liquidity_change_usd || null}
		/>

		<Links links={data.data.links || null} />
	</div>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that token is not available. Please make sure you entered a token address and selected
		the correct chain.
	</p>
{/if}
