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
	import Line, { type LineOptions } from '$lib/components/charts/Line.svelte';
	import {
		formatCryptoPrice,
		formatLargeNumber,
		formatPercentage
	} from '$lib/utils/formatting.svelte';

	const { data } = $props();

	let lineChartOptions: LineOptions | undefined = $state(undefined);

	onMount(() => {
		lineChartOptions = {
			name: data.data.token_name,
			symbol: data.data.token_symbol,
			currency: 'usd',
			time: new Date().toISOString()
		};
	});

	async function getPairs(tokenAddress: string, chainId: string) {
		const response = await fetch(`/api/token/getPairs?address=${tokenAddress}&chain=${chainId}`);
		if (!response.ok) {
			throw new Error('Failed to fetch pairs');
		}
		console.log('Pairs response:', response);
		return response.json();
	}

	function getQuoteToken(pair: Array<any>) {
		if (!pair || pair.length !== 2) {
			console.warn('Invalid pair object structure:', pair);
			return { symbol: 'N/A', name: 'N/A', logo: '' };
		}

		// Find the token object within the 'pair' array whose 'pair_token_type' is "token1"
		const quoteToken = pair.find((token: any) => token.pair_token_type === 'token1');

		if (quoteToken) {
			return {
				symbol: quoteToken.token_symbol,
				name: quoteToken.token_name,
				logo: quoteToken.token_logo
			};
		}

		// Fallback if quoteToken isn't found (shouldn't happen with valid data)
		console.warn("Quote token with pair_token_type 'token1' not found:", pair);
		return { symbol: 'N/A', name: 'N/A', logo: '' };
	}
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
		<wa-tab panel="pairs">Pairs</wa-tab>
		<wa-tab disabled panel="technical-analysis">Technical Analysis</wa-tab>

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
		<wa-tab-panel name="pairs">
			<h2>Token Pairs</h2>
			{#await getPairs(data.data.token_address, data.data.chain_id)}
				<p role="alert">Loading pairs...</p>
			{:then pairs}
				<p role="alert">{pairs.page_size} pairs found</p>
				{#if pairs && pairs.pairs && pairs.pairs.length > 0}
					<table>
						<thead>
							<tr>
								<th>Pair</th>
								<th>Exchange</th>
								<th>Current Price</th>
								<th>24h Price Change</th>
								<th>Liquidity (USD)</th>
								<th>24h Volume (USD)</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each pairs.pairs as pair}
								<tr>
									<td>{pair.pair_label} ({getQuoteToken(pair.pair).name})</td>
									<td>{pair.exchange_name ? pair.exchange_name : 'N/A'}</td>
									<td>{formatCryptoPrice(pair.usd_price)}</td>
									<td>{formatPercentage(pair.usd_price_24hr_percent_change)}</td>
									<td>{formatLargeNumber(pair.liquidity_usd, undefined, true, '$')}</td>
									<td>{formatLargeNumber(pair.volume_24h_usd, undefined, true, '$')}</td>
									<td>{pair.inactive_pair ? 'Inactive' : 'Active'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p>No pairs found for this token.</p>
				{/if}
			{:catch error}
				<p role="alert">Error loading pairs: {error.message}</p>
			{/await}
		</wa-tab-panel>
		<wa-tab-panel name="technical-analysis">
			{#if lineChartOptions}
				<Line data={[{ x: 1, y: 1 }]} options={lineChartOptions} />
			{/if}
		</wa-tab-panel>
	</wa-tab-group>
{:else}
	<h1>Data not available</h1>
	<p>
		Data for that token is not available. Please make sure you entered a token address and selected
		the correct chain.
	</p>
{/if}
