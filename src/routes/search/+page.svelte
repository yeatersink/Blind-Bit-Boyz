<script lang="ts">
	import {
		chainList,
		chains,
		getChainKeyByMoralisId,
		getChainNameByMoralisId
	} from '$lib/utils/chains';
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
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let loading: boolean = $state(false);
	let search = $state('');
	let chain = $state('eth');
	let limit = $state(10);
	let verified = $state(false);
	let boostVerified = $state(false);
	let sortBy = $state('volume1hDesc');
	let results = $state(null);
	let error: string | null = $state(null);

	let savedSearches: Array<{
		id: number;
		type: string;
		chain: string;
		name: string;
		value: string;
	}> = $state([]);
	const searchTypes: {
		[key: string]: {
			label: string;
		};
	} = {
		token: {
			label: 'Token'
		},
		pair: {
			label: 'Pair'
		}
	};
	let searchType = $state('token');
	let save = $state(false);
	let name = $state('');

	/*
	onMount(() => {
		if (localStorage.getItem('savedSearches')) {
			savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
		} else {
			savedSearches = [];
		}
	});

	function saveSearch() {
		if (dev) {
			console.log('Saving search:', { searchType, id, name });
		}
		const newSearch = {
			id: Date.now(),
			type: searchType,
			name,
			chain,
			value: id
		};
		savedSearches.push(newSearch);
		localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
		if (dev) {
			console.log('Saved searches:', savedSearches);
		}
	}

	function deleteSavedSearch(id: number) {
		if (dev) {
			console.log('Deleting search:', id);
		}
		savedSearches = savedSearches.filter((search) => search.id !== id);
		localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
		if (dev) {
			console.log('Saved searches:', savedSearches);
		}
	}
*/

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

<!--
{#if savedSearches.length > 0}
	<h2>Saved Searches</h2>
	<ul>
		{#each savedSearches as search (search.id)}
			<li>
				<a href={`/${search.type}/${search.value}?chain=${search.chain}`}>
					{search.name} ({search.type} from {chains[search.chain as keyof typeof chains].name}): {search.value}
				</a>
				<EnvisionButton
					size="small"
					text={`Delete ${search.name}`}
					onclick={() => deleteSavedSearch(search.id)}
				/>
			</li>
		{/each}
	</ul>
{/if}
-->

<!--
<fieldset>
	<legend>What would you like to search for?</legend>
	{#each Object.entries(searchTypes) as [key, { label }], i (key)}
		<label for={key}>{label}</label>
		<input
			defaultChecked={i === 0}
			type="radio"
			id={key}
			name="search-type"
			value={key}
			bind:group={searchType}
		/>
	{/each}
</fieldset>

</div>

<label for="search">{searchTypes[searchType].label} ID:</label>
<input id="search" type="text" bind:value={id} placeholder="Enter the ID..." />

<div>
	<input type="checkbox" id="save" bind:checked={save} />
	<label for="save">Save this search</label>
</div>

{#if save}
	<div>
		<label for="save-name">Name:</label>
		<input id="save-name" type="text" bind:value={name} placeholder="Enter a name..." />
	</div>
{/if}
-->

<div>
	<wa-input label="Search" type="search" value={search} oninput={(e) => (search = e.target.value)}
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
		<ul class="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each results.result as result}
				<li>
					<wa-card>
						<div slot="header">
							<wa-button
								appearance="plain"
								href={`/token/${result.tokenAddress}?chain=${getChainKeyByMoralisId(result.chainId)}`}
							>
								<h3>{result.name} ({result.symbol})</h3>
							</wa-button>
						</div>
						<p>${result.usdPrice}</p>
						<p>Address: {result.tokenAddress}</p>
						<wa-copy-button value={result.tokenAddress}></wa-copy-button>

						<p>Chain: {getChainNameByMoralisId(result.chainId) ?? result.chainId}</p>
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
