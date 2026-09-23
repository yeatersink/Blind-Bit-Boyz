<script lang="ts">
	import { onMount } from 'svelte';
	import Saved from '$lib/components/SavedSearches/Saved.svelte';
	import Bookmark from '$lib/components/SavedSearches/Bookmark.svelte';
	import { savedSearchService } from '$lib/utils/saved.svelte';
	import { chainLabel, chainList } from '$lib/utils/chains';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
	import {
		readStoredDataSource,
		storeDataSource,
		type DataSource,
		type SearchHit,
		type SearchPayload
	} from '$lib/utils/searchResults';
	import '@awesome.me/webawesome/dist/components/input/input.js';
	import '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
	import '@awesome.me/webawesome/dist/components/details/details.js';
	import '@awesome.me/webawesome/dist/components/select/select.js';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/divider/divider.js';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';

	let loading = $state(false);
	let search = $state('');
	let chain = $state('eth');
	let dataSource = $state<DataSource>('gecko');
	let limit = $state(10);
	let verified = $state(false);
	let boostVerified = $state(false);
	let sortBy = $state('volume1hDesc');
	let results = $state<SearchPayload | null>(null);
	let error = $state<string | null>(null);

	function fieldValue(event: Event): string {
		const element = (event.currentTarget ?? event.target) as { value?: string | null } | null;
		return typeof element?.value === 'string' ? element.value : '';
	}

	function fieldChecked(event: Event): boolean {
		const element = (event.currentTarget ?? event.target) as { checked?: boolean } | null;
		return !!element?.checked;
	}

	function onSourceChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (value !== 'gecko' && value !== 'moralis') return;
		dataSource = value;
		storeDataSource(value);
	}

	function priceText(price: SearchHit['priceUsd']): string {
		if (price === null || price === undefined || price === '') return 'N/A';
		const numeric = typeof price === 'number' ? price : Number(price);
		return Number.isFinite(numeric) ? formatCryptoPrice(numeric) : String(price);
	}

	function resultAddress(hit: SearchHit): string {
		return hit.type === 'pair' ? (hit.pairAddress ?? '') : (hit.tokenAddress ?? '');
	}

	function resultHref(hit: SearchHit): string | null {
		const chainKey = hit.chainKey || hit.chainId;
		if (hit.type === 'pair' && hit.pairAddress) {
			return `/pair/${hit.pairAddress}?chain=${chainKey}`;
		}
		if (hit.type === 'token' && hit.tokenAddress) {
			return `/token/${hit.tokenAddress}?chain=${chainKey}`;
		}
		return null;
	}

	function volumeText(volume: SearchHit['volumeUsd']): string {
		if (volume === null || volume === undefined || volume === '') return '';
		const numeric = typeof volume === 'number' ? volume : Number(volume);
		return Number.isFinite(numeric) ? formatCryptoPrice(numeric) : String(volume);
	}

	async function getSearchResults() {
		loading = true;
		error = null;
		results = null;
		const params = new URLSearchParams({
			source: dataSource,
			search,
			chain
		});
		if (dataSource === 'moralis') {
			params.set('limit', String(limit));
			params.set('verified', String(verified));
			params.set('boostVerified', String(boostVerified));
			params.set('sortBy', sortBy);
		}

		const response = await fetch(`/api/search?${params.toString()}`);
		let body: (SearchPayload & { error?: string }) | null = null;
		try {
			body = await response.json();
		} catch {
			body = null;
		}
		if (!response.ok) {
			error = body?.error || 'Search failed.';
			loading = false;
			return;
		}
		if (body && Array.isArray(body.result)) {
			results = body;
		} else if (body?.error) {
			error = body.error;
		} else {
			error = 'Something went wrong';
		}
		loading = false;
	}

	onMount(() => {
		dataSource = readStoredDataSource();
		storeDataSource(dataSource);
	});
</script>

<svelte:head>
	<title>Search</title>
	<meta
		name="description"
		content="Search for a token or pool by name, symbol, or contract address"
	/>
</svelte:head>

<h1>Search</h1>

<wa-tab-group>
	<wa-tab panel="new">New</wa-tab>
	<wa-tab disabled={!savedSearchService.count} panel="saved"
		>Saved ({savedSearchService.count})</wa-tab
	>

	<wa-tab-panel name="new">
		<form
			novalidate
			onsubmit={(event) => {
				event.preventDefault();
				void getSearchResults();
			}}
		>
			<div>
				<label for="search-source">Data source</label>
				<select id="search-source" value={dataSource} onchange={onSourceChange}>
					<option value="gecko">Gecko Terminal</option>
					<option value="moralis">Moralis</option>
				</select>
			</div>

			<div>
				<label for="search-chain">Chain</label>
				<select id="search-chain" bind:value={chain}>
					{#each chainList as chainItem}
						<option value={chainItem.value}>{chainItem.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="search-query">Name, symbol, or contract address</label>
				<input id="search-query" type="search" bind:value={search} />
			</div>

			{#if dataSource === 'moralis'}
				<wa-details summary="Advanced">
					<section>
						<div>
							<wa-input
								label="Limit Number"
								type="number"
								hint="How many results to return"
								value={String(limit)}
								min="1"
								max="50"
								step="1"
								oninput={(event: Event) => {
									const next = parseInt(fieldValue(event), 10);
									if (Number.isFinite(next)) limit = next;
								}}
							></wa-input>
						</div>
						<div>
							<wa-checkbox
								hint="Only show verified contracts"
								checked={verified}
								onchange={(event: Event) => (verified = fieldChecked(event))}>Verified</wa-checkbox
							>
						</div>
						<div>
							<wa-checkbox
								hint="Make verified contracts appear first"
								checked={boostVerified}
								onchange={(event: Event) => (boostVerified = fieldChecked(event))}
								>Boost Verified</wa-checkbox
							>
						</div>
						<div>
							<wa-select
								label="Sort By"
								value={sortBy}
								onchange={(event: Event) => (sortBy = fieldValue(event))}
							>
								<wa-option value="volume1hDesc">Volume 1h Desc</wa-option>
								<wa-option value="volume24hDesc">Volume 24h Desc</wa-option>
								<wa-option value="liquidityDesc">Liquidity Desc</wa-option>
								<wa-option value="marketCapDesc">Market Cap Desc</wa-option>
							</wa-select>
						</div>
					</section>
				</wa-details>
			{:else}
				<p>Verified, boost verified, sort, and limit apply to Moralis only.</p>
			{/if}

			<div>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<wa-button role="button" tabindex="0" type="button" onclick={() => getSearchResults()}
					>Search</wa-button
				>
			</div>
		</form>

		{#if dataSource === 'gecko' || results?.source === 'gecko'}
			<p>
				<a href="https://www.geckoterminal.com/?utm_source=blind-bit-boyz&utm_medium=referral">
					On-chain data provided by GeckoTerminal
				</a>
			</p>
		{/if}

		{#if results}
			<wa-divider></wa-divider>
			<h2>Results</h2>
			<p role="alert">{results.total} results found</p>
			{#if results.result.length > 0}
				<ul
					class="mx-8 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
				>
					{#each results.result as result (result.type + (result.pairAddress ?? result.tokenAddress))}
						<li>
							<wa-card>
								<div slot="header" class="flex items-center justify-between">
									<h3>
										{#if resultHref(result)}
											<a href={resultHref(result)}>
												{result.name}{result.symbol ? ` (${result.symbol})` : ''}
											</a>
										{:else}
											{result.name}{result.symbol ? ` (${result.symbol})` : ''}
										{/if}
									</h3>
									{#if resultAddress(result)}
										<Bookmark
											address={resultAddress(result)}
											name={result.name}
											chainId={result.chainKey || result.chainId}
											type={result.type}
										/>
									{/if}
								</div>
								<p>Chain: {chainLabel(result.chainKey || result.chainId)}</p>
								<p>Price: {priceText(result.priceUsd)}</p>
								{#if volumeText(result.volumeUsd)}
									<p>Volume: {volumeText(result.volumeUsd)}</p>
								{/if}
								<p>{result.type === 'pair' ? 'Pair' : 'Token'}</p>
								<p>Address: {resultAddress(result)}</p>
								<wa-copy-button value={resultAddress(result)}></wa-copy-button>
								<p>
									Verified contract: {result.verified === null || result.verified === undefined
										? 'n/a'
										: result.verified
											? 'Yes'
											: 'No'}
								</p>
								<p>
									Security score: {result.securityScore === null ||
									result.securityScore === undefined
										? 'n/a'
										: `${result.securityScore}/100`}
								</p>
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
