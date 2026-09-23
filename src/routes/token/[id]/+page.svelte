<script lang="ts">
	import Performance from '$lib/components/panels/Performance.svelte';
	import Links from '$lib/components/panels/Links.svelte';
	import Hero from '$lib/components/panels/Hero.svelte';
	import Token from '$lib/components/panels/Token.svelte';
	import Health from '$lib/components/panels/Health.svelte';
	import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
	import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
	import {
		formatCryptoPrice,
		formatLargeNumber,
		formatPercentage
	} from '$lib/utils/formatting.svelte';
	import { readStoredDataSource } from '$lib/utils/searchResults';

	let active: boolean = $state(true);

	const { data } = $props();

	async function getPairs(tokenAddress: string, chainId: string) {
		const source = readStoredDataSource();
		const params = new URLSearchParams({
			address: tokenAddress,
			chain: chainId,
			source
		});
		const response = await fetch(`/api/token/getPairs?${params}`);
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			return {
				error: body?.error || 'Failed to fetch pairs',
				pairs: [],
				page_size: 0
			};
		}
		return body;
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

	function filterPairs(pairs: Array<any>) {
		let filteredPairs: Array<any> = pairs;
		if (active) {
			filteredPairs = filteredPairs.filter((pair) => !pair.inactive_pair);
		}
		return filteredPairs;
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
		address={data.data.token_address}
		name={data.data.token_name}
		chainId={data.data.chain_id}
		symbol={data.data.token_symbol}
		logo={data.data.token_logo}
		usd={data.data.price_usd || null}
		usdChange={data.data.price_percent_change_usd || null}
		marketCap={data.data.market_cap || null}
		fullyDilutedValuation={data.data.fully_diluted_valuation || null}
		volumeChange={data.data.volume_change_usd || null}
		type="token"
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
			{#await getPairs(data.tokenAddress ?? '', data.chainKey ?? '')}
				<p role="alert">Loading pairs...</p>
			{:then pairs}
				{#if pairs.error}
					<p role="alert">{pairs.error}</p>
				{/if}
				<p role="alert">{pairs.page_size ?? 0} pairs found</p>

				<div>
					<wa-checkbox
						hint="Only show active pairs"
						checked={active}
						defaultChecked={true}
						onchange={(event: Event) => {
							const target = event.currentTarget as { checked?: boolean } | null;
							active = !!target?.checked;
						}}
						>Active
					</wa-checkbox>
				</div>

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
								{#if !active}
									<th>Status</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each filterPairs(pairs.pairs) as pair}
								<tr>
									<td>
										<wa-button
											appearance="plain"
											href={`/pair/${pair.pair_address}?chain=${data.chainKey ?? ''}`}
										>
											{pair.pair_label} ({getQuoteToken(pair.pair).name})
										</wa-button>
									</td>
									<td>{pair.exchange_name ? pair.exchange_name : 'N/A'}</td>
									<td>{formatCryptoPrice(pair.usd_price)}</td>
									<td>{formatPercentage(pair.usd_price_24hr_percent_change)}</td>
									<td>{formatLargeNumber(pair.liquidity_usd, undefined, true, '$')}</td>
									<td>{formatLargeNumber(pair.volume_24h_usd, undefined, true, '$')}</td>
									{#if !active}
										<td>{pair.inactive_pair ? 'Inactive' : 'Active'}</td>
									{/if}
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
			<p>Open a pair to view candlestick and line charts.</p>
		</wa-tab-panel>
	</wa-tab-group>
{:else}
	<h1>Data not available</h1>
	<p role="alert">
		{data.error ??
			'Data for that token is not available. Please make sure you entered a token address and selected the correct chain.'}
	</p>
	{#if data.sourceHint}
		<p>{data.sourceHint}</p>
	{/if}
	{#if data.tokenAddress && data.chainKey}
		<h2>Token Pairs</h2>
		{#await getPairs(data.tokenAddress, data.chainKey)}
			<p role="alert">Loading pairs...</p>
		{:then pairs}
			{#if pairs.error}
				<p role="alert">{pairs.error}</p>
			{/if}
			<p role="alert">{pairs.page_size ?? 0} pairs found</p>
			{#if pairs.pairs && pairs.pairs.length > 0}
				<ul>
					{#each pairs.pairs as pair}
						<li>
							<a href={`/pair/${pair.pair_address}?chain=${data.chainKey}`}>
								{pair.pair_label} ({getQuoteToken(pair.pair).name})
							</a>
						</li>
					{/each}
				</ul>
			{:else if !pairs.error}
				<p>No pairs found for this token.</p>
			{/if}
		{:catch error}
			<p role="alert">Error loading pairs: {error.message}</p>
		{/await}
	{/if}
{/if}
