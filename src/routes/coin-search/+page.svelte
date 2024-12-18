<script lang="ts">
	import { goto } from '$app/navigation';
	import { request, gql } from 'graphql-request';

	let query = $state('');
	let status: 'loading' | 'done' | 'error' | undefined = $state(undefined);
	let sortingOptions: Array<{ name: string; value: string }> = [
		{ name: 'Price', value: 'price' },
		{ name: 'Name', value: 'name' },
		{ name: 'Symbol', value: 'symbol' }
	];
	let currentSortingOption: string = $state(sortingOptions[0].value);
	let sortingDirection: 'asc' | 'desc' = $state('asc');
	//The type of the results
	type resultType = {
		name: string;
		symbol: string;
		address: string;
		price: number;
		chainId?: string;
		pairedToken?: {
			pairAddress: string;
			name: string;
			symbol: string;
			address: string;
		};
	};
	let results: Array<resultType> = $state([]);
	let prices: { [key: string]: { price: string; name: string } } = {};
	let dataProvidersList: Array<{
		name: string;
		value: string;
		exchanges?: Array<{ name: string; value: string }>;
	}> = [
		{ name: 'Dex Screener', value: 'dexscreener' },
		{ name: 'Pulsechain', value: 'pulse', exchanges: [{ name: 'PulseX', value: 'pulsex' }] }
	];
	let currentDataProvider: string = $state(dataProvidersList[0].value);
	let blockchainList = [{ name: 'Pulse Chain', value: 'pls' }];
	let currentBlockchain: string = $state(blockchainList[0].value);

	async function searchCryptocurrencies() {
		status = 'loading';
		results = [];
		if (currentDataProvider == 'dexscreener') {
			searchDexscreener();
		} else if (currentDataProvider == 'pulse') {
			searchPulseChain();
		}
	}

	async function searchDexscreener() {
		let data: any;
		//Checks if the user entered a contract address
		if (query.startsWith('0x') && query.length == 42) {
			const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
			data = await response.json();
		} else {
			const response = await fetch(
				`https://api.dexscreener.com/latest/dex/search?q=${currentBlockchain}/${query}`
			);
			data = await response.json();
		}
		for (let item of data.pairs) {
			results.push({
				name: item.baseToken.name,
				symbol: item.baseToken.symbol,
				address: item.baseToken.address,
				price: item.priceUsd,
				chainId: item.chainId,
				pairedToken: {
					pairAddress: item.pairAddress,
					name: item.quoteToken.name,
					symbol: item.quoteToken.symbol,
					address: item.quoteToken.address
				}
			});
		}
		status = 'done';
	}

	async function searchPulseChain() {
		let data: any;
		const endPoint = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex';
		let gqlQuery = gql``;
		let variables: { [key: string]: string } = {};
		if (query.startsWith('0x') && query.length == 42) {
			gqlQuery = gql`
				query GetToken($address: String!) {
					token(id: $address) {
						id
						name
						symbol
						derivedUSD
					}
				}
			`;
			variables = {
				address: query
			};
		} else {
			gqlQuery = gql`
				query GetTokens($name: String!, $symbol: String!) {
					tokens(
						where: { or: [{ name_contains_nocase: $name }, { symbol_contains_nocase: $symbol }] }
					) {
						id
						name
						symbol
						derivedUSD
					}
				}
			`;
			variables = {
				name: query,
				symbol: query
			};
		}

		try {
			data = await request(endPoint, gqlQuery, variables);

			if (data.token) {
				results = [
					{
						name: data.token.name,
						symbol: data.token.symbol,
						address: data.token.id,
						price: data.token.derivedUSD
					}
				];
			} else {
				results = data.tokens.map((token: any) => ({
					name: token.name,
					symbol: token.symbol,
					address: token.id,
					price: token.derivedUSD
				}));
			}
			status = 'done';
		} catch (error) {
			console.error(error);
			status = 'error';
		}
	}

	function getResultUrl(result: resultType) {
		let url = result.address;
		if (result.chainId && result.pairedToken?.pairAddress) {
			url += `?chainId=${result.chainId}&pairAddress=${result.pairedToken.pairAddress}`;
		}
		return url;
	}

	function sortResults() {
		if (results.length < 2) {
			{
				return;
			}

			switch (currentSortingOption) {
				case 'price': {
					results.sort((a, b) => {
						if (a.price && b.price) {
							return sortingDirection === 'asc' ? a.price - b.price : b.price - a.price;
						}
					});
					break;
				}
				case 'name': {
					results.sort((a, b) => {
						return sortingDirection === 'asc'
							? a.name.localeCompare(b.name)
							: b.name.localeCompare(a.name);
					});
					break;
				}
				case 'symbol': {
					results.sort((a, b) => {
						return sortingDirection === 'asc'
							? a.symbol.localeCompare(b.symbol)
							: b.symbol.localeCompare(a.symbol);
					});
					break;
				}
			}
		}
	}
</script>

<svelte:head>
	<title>Search for a Coin.</title>
</svelte:head>

<section class="bg-gray-800 px-6 py-16 text-center">
	<h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">Coin Search</h1>
	<form
		class="flex flex-col items-center gap-4 text-left"
		onsubmit={(event) => {
			event.preventDefault();
			searchCryptocurrencies();
		}}
	>
		<div class="flex flex-col items-center gap-2">
			<label for="provider">Choose Your Data Provider</label>
			<select
				id="provider"
				class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
				bind:value={currentDataProvider}
			>
				{#each dataProvidersList as provider}
					<option value={provider.value}>{provider.name}</option>
				{/each}
			</select>
		</div>
		<div class="flex flex-col items-center gap-2">
			<label for="blockchain">Choose Which Block Chain You Want to Search</label>
			<select
				id="blockchain"
				class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={currentBlockchain}
				disabled={currentDataProvider !== 'dexscreener'}
			>
				{#each blockchainList as blockchain}
					<option value={blockchain.value}>{blockchain.name}</option>
				{/each}
			</select>
		</div>
		<div class="flex flex-col items-center gap-2">
			<label for="search">Search Cryptocurrencies</label>
			<input
				id="search"
				class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-400 hover:border-gray-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
				type="search"
				bind:value={query}
				placeholder="Enter your search"
			/>
		</div>
		<button
			class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
			type="submit">Search</button
		>
	</form>
</section>

{#if status == 'loading'}
	<p role="alert">Loading...</p>
{:else if status == 'error'}
	<p role="alert">Error loading data</p>
{:else if status == 'done'}
	{#if results.length > 0}
		<h2 role="alert">Results: {results.length}</h2>
		<label for="sorting">Sort by:</label>
		<select id="sorting" bind:value={currentSortingOption}>
			{#each sortingOptions as option}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>
		<select id="sortingDirection" bind:value={sortingDirection}>
			<option value="asc">Ascending</option>
			<option value="desc">Descending</option>
		</select>
		<button onclick={() => sortResults()}>Sort</button>
		{#if currentDataProvider == 'pulse'}
			<p role="alert">
				The Pulsechain data provider intigration is currently still in development and not fully
				functional.
			</p>
		{/if}
		<ul>
			{#each results as result}
				<li>
					<a href={`/coins/${getResultUrl(result)}`} target="_blank">
						<h3>
							{result.name}: {result.price ? '$' + result.price.toString() : 'Price not available'}
						</h3>
						<p>{result.symbol}</p>
						<p>{result.address}</p>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p role="alert">No results found</p>
	{/if}
{/if}
