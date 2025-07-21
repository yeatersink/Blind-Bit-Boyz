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
	import Performance from '$lib/components/panels/Performance.svelte';
	import Liquidity from '$lib/components/panels/Liquidity.svelte';
	import Links from '$lib/components/panels/Links.svelte';
	import Hero from '$lib/components/panels/Hero.svelte';
	import Token from '$lib/components/panels/Token.svelte';
	import Health from '$lib/components/Health.svelte';
	import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';

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
		marketCap={data.data.market_cap || null}
		fullyDilutedValuation={data.data.fully_diluted_valuation || null}
		volumeChange={data.data.volume_change_usd || null}
	/>

	<wa-tab-group>
		<wa-tab panel="overview">Overview</wa-tab>
		<wa-tab panel="technical-analysis">Technical Analysis</wa-tab>

		<wa-tab-panel name="overview">
			<Token
				address={data.data.token_address}
				symbol={data.data.token_symbol}
				chainHexId={data.data.chain_id}
				ageInDays={data.data.token_age_in_days}
			/>

			<Performance
				priceChange={data.data.price_percent_change_usd || null}
				volumeChange={data.data.volume_change_usd}
				netVolumeChange={data.data.net_volume_change_usd || null}
				liquidityChange={data.data.liquidity_change_usd || null}
				holdersChange={data.data.holders_change || null}
				experiencedNetBuyersChange={data.data.experienced_net_buyers_change || null}
			/>

			<Health
				securityScore={data.data.security_score || null}
				onChainStrengthIndex={data.data.on_chain_strength_index || null}
			/>

			<Links links={data.data.links || null} />
		</wa-tab-panel>
		<wa-tab-panel name="technical-analysis">
			<p>Technical analysis data will be displayed here.</p>
			<!-- Placeholder for future technical analysis component -->
		</wa-tab-panel>
	</wa-tab-group>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that token is not available. Please make sure you entered a token address and selected
		the correct chain.
	</p>
{/if}
