<script lang="ts">
	import Saved from '$lib/components/Saved.svelte';
	import { savedSearchService } from '$lib/utils/saved.svelte';
	import { chainList, chains, getChainKeyByMoralisId } from '$lib/utils/chains';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { EnvisionButton } from '@envisionly/envisiontech-core';
	import '@awesome.me/webawesome/dist/components/select/select.js';
	import '@awesome.me/webawesome/dist/components/input/input.js';
	import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
	import '@awesome.me/webawesome/dist/components/details/details.js';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/divider/divider.js';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';

	let loading: boolean = $state(false);
	let search = $state('');
	let chain = $state('eth');
	let limit = $state(10);
	let verified = $state(false);
	let boostVerified = $state(false);
	let sortBy = $state('volume1hDesc');
	let results = $state(null);
	let error: string | null = $state(null);

	async function getSearchResults() {
		loading = true;
		error = null;
		results = null;
		if (dev) {
			console.log('Searching for:', { search, chain, limit, verified, boostVerified, sortBy });
		}

		const params = new URLSearchParams({
			search,
			chain,
			limit: limit.toString(),
			verified: verified.toString(),
			boostVerified: boostVerified.toString(),
			sortBy
		});

		const response = await fetch(`/api/search?${params.toString()}`);
		console.log(response);

		if (!response.ok) {
			console.error('Failed to fetch search results:', response.statusText);
			error = response.statusText;
			loading = false;
			return;
		}
		const newResponse = await response.json();
		if (newResponse.data) {
			results = newResponse.data;
			if (dev) {
				console.log('Search results:', $state.snapshot(results));
			}
		} else if (newResponse.error) {
			error = newResponse.error;
		} else {
			error = 'Something went wrong';
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="Search for a token by its ID" />
</svelte:head>

<h1>Search</h1>

<wa-tab-group>
	<wa-tab panel="new">New</wa-tab>
	<wa-tab disabled={!savedSearchService.count} panel="saved"
		>Saved ({savedSearchService.count})</wa-tab
	>

	<wa-tab-panel name="new">
		<div>
			<wa-input
				label="Search"
				type="search"
				value={search}
				oninput={(e) => (search = e.target.value)}
			></wa-input>
		</div>

		<div>
			<wa-select label="Chain" value={chain} onchange={(e) => (chain = e.target.value)}>
				{#each chainList as chainItem}
					<wa-option value={chainItem.value}>
						{chainItem.label}
					</wa-option>
				{/each}
			</wa-select>
		</div>

		<wa-details summary="Advanced">
			<section>
				<div>
					<wa-input
						label="Limit Number"
						type="number"
						hint="How many results to return"
						value={limit}
						min="1"
						max="50"
						step="1"
						oninput={(e) => (limit = parseInt(e.target.value))}
					>
					</wa-input>
				</div>

				<div>
					<wa-checkbox
						hint="Only show verified contracts"
						checked={verified}
						onchange={(e) => (verified = e.target.checked)}
						>Verified
					</wa-checkbox>
				</div>

				<div>
					<wa-checkbox
						hint="Make verified contracts appear first"
						checked={boostVerified}
						onchange={(e) => (boostVerified = e.target.checked)}
						>Boost Verified
					</wa-checkbox>
				</div>

				<div>
					<wa-select label="Sort By" value={sortBy} onchange={(e) => (sortBy = e.target.value)}>
						<wa-option value="volume1hDesc" selected>Volume 1h Desc</wa-option>
						<wa-option value="volume24hDesc">Volume 24h Desc</wa-option>
						<wa-option value="liquidityDesc">Liquidity Desc</wa-option>
						<wa-option value="marketCapDesc">Market Cap Desc</wa-option>
					</wa-select>
				</div>
			</section>
		</wa-details>

		<div>
			<wa-button onclick={getSearchResults}> Search </wa-button>
		</div>

		{#if results}
			<wa-divider></wa-divider>

			<h2>Results</h2>
			{#if results.total}
				<p role="alert">{results.total} results found</p>
			{/if}
			{#if results.result}
				<ul
					class="mx-8 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
				>
					{#each results.result as result}
						<li>
							<wa-card>
								<div slot="header" class="flex items-center justify-between">
									<wa-button
										appearance="plain"
										href={`/token/${result.tokenAddress}?chain=${result.chainId}`}
									>
										<h3>{result.name} ({result.symbol})</h3>
									</wa-button>

									<wa-button
										variant="neutral"
										appearance="plain"
										onclick={() => {
											if (savedSearchService.has(result.tokenAddress, result.chainId)) {
												savedSearchService.remove(result.tokenAddress, result.chainId);
											} else {
												savedSearchService.add(
													result.tokenAddress,
													result.name,
													result.chainId,
													'token'
												);
											}
										}}
										><wa-icon
											variant={savedSearchService.has(result.tokenAddress, result.chainId)
												? 'solid'
												: 'regular'}
											name="bookmark"
											label={savedSearchService.has(result.tokenAddress, result.chainId)
												? 'Remove bookmark'
												: 'Add bookmark'}
										></wa-icon></wa-button
									>
								</div>
								<p>{formatCryptoPrice(result.usdPrice)}</p>
								<p>Address: {result.tokenAddress}</p>
								<wa-copy-button value={result.tokenAddress}></wa-copy-button>

								<p>
									Chain: {chains[getChainKeyByMoralisId(result.chainId)].name ?? result.chainId}
								</p>
								<p>Verified contract: {result.isVerifiedContract}</p>
								<p>Security score: {result.securityScore}/100</p>
								<div slot="footer"></div>
							</wa-card>
						</li>
					{/each}
				</ul>
			{/if}
		{:else if error}
			<wa-divider></wa-divider>

			<h2>Error</h2>
			<p role="alert">Error: {error}</p>
		{:else if loading}
			<wa-divider></wa-divider>

			<p role="alert">Searching...</p>
		{/if}
	</wa-tab-panel>
	<wa-tab-panel name="saved">
		<Saved />
	</wa-tab-panel>
</wa-tab-group>
