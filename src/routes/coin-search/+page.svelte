<script lang="ts">
	import { goto } from '$app/navigation';
	import { request, gql } from 'graphql-request';

	let query = $state('');
	let status: 'loading' | 'done' | 'error' | undefined = $state(undefined);
	let sortingOptions: Array<{ name: string; value: string }> = [
		{ name: 'Name Ascending', value: 'name-asc' },
		{ name: 'Name Descending', value: 'name-desc' },
		{ name: 'Price Ascending', value: 'price-asc' },
		{ name: 'Price Descending', value: 'price-desc' },
		{ name: 'Symbol Ascending', value: 'symbol-asc' },
		{ name: 'Symbol Descending', value: 'symbol-desc' }
	];
	let currentSortingOption: string = $state(sortingOptions[0].value);
	let sortingDirection: 'asc' | 'desc' = $state('asc');
	//The type of the results
	type resultType = {
		name: string;
		symbol: string;
		address: string;
url: string;
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
				url: `${item.baseToken.address}?dataProvider=${currentDataProvider}&chainId=${item.chainId}&pairAddress=${item.pairAddress}`,
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
		sortResults();
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
						url: `${data.token.id}?dataProvider=${currentDataProvider}`,
						price: data.token.derivedUSD
					}
				];
			} else {
				results = data.tokens.map((token: any) => ({
					name: token.name,
					symbol: token.symbol,
					address: token.id,
url: `${token.id}?dataProvider=${currentDataProvider}`,
					price: token.derivedUSD
				}));
			}
			status = 'done';
			sortResults();
		} catch (error) {
			console.error(error);
			status = 'error';
		}
	}


	function sortResults() {
		if (results.length < 2) {
			return;
		}

		switch (currentSortingOption) {
			case 'name-asc': {
				results.sort((a, b) => {
					return a.name.localeCompare(b.name);
				});
				break;
			}
			case 'name-desc': {
				results.sort((a, b) => {
					return b.name.localeCompare(a.name);
				});
				break;
			}
			case 'price-asc': {
				results.sort((a, b) => {
					if (a.price && b.price) {
						return a.price - b.price;
					}
				});
				break;
			}
			case 'price-desc': {
				results.sort((a, b) => {
					if (a.price && b.price) {
						return b.price - a.price;
					}
				});
				break;
			}
			case 'symbol-asc': {
				results.sort((a, b) => {
					return a.symbol.localeCompare(b.symbol);
				});
				break;
			}
			case 'symbol-desc': {
				results.sort((a, b) => {
					return b.symbol.localeCompare(a.symbol);
				});
				break;
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
			<div class="flex flex-col items-center">
				<input
					id="search"
					class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
					type="search"
					bind:value={query}
					aria-describedby="search-help"
				/>
				<p id="search-help" class="text-sm text-gray-400">
					You can search by name, symbol, or contract address
				</p>
			</div>
		</div>
		<button
			class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
			type="submit">Search</button
		>
	</form>
</section>

<div class="p-6">
	<div role="status" aria-live="polite">
		{#if status == 'loading'}
			<p class="sr-only">Loading...</p>
			<span class="fa-solid fa-spinner fa-spin text-gold-500" aria-hidden="true"></span>
		{:else if status == 'error'}
			<p class="text-red-500" role="alert">An error occurred while fetching the data</p>
		{:else if status == 'done'}
			<h2 class="mb-4 text-2xl font-semibold text-gray-100">Results: {results.length}</h2>
		{/if}
	</div>

	{#if status == 'done'}
		<section class="flex flex-col gap-4">
			{#if results.length > 0}
				<div>
					<label for="sorting">Sort by:</label>
					<select
						id="sorting"
						class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
						bind:value={currentSortingOption}
						onchange={sortResults}
					>
						{#each sortingOptions as option}
							<option value={option.value}>{option.name}</option>
						{/each}
					</select>
					{#if currentDataProvider == 'pulse'}
						<p role="alert">
							The Pulsechain data provider intigration is currently still in development and not
							fully functional.
						</p>
					{/if}
				</div>
				<div role="separator" class="border-t border-gray-600"></div>
				<ul class="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4">
					{#each results as result}
						<li class="rounded-md bg-gray-800 p-4">
							<a
								class="visited:text-gold-400 hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
								href={`/coins/${result.url}`}
								target="_blank"
							>
								<h3 class="text-xl font-semibold">
									{result.name}: {result.price ? '$' + result.price : 'Price not available'}
								</h3>
							</a>
							<p>{result.symbol}</p>
							<div class="flex items-center justify-between">
								<p>{result.address}</p>
								<button
									class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
									onclick={() => navigator.clipboard.writeText(result.address)}
									aria-label={`Copy ${result.name} address`}
									><span class="fa-solid fa-copy"></span></button
								>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No results found</p>
			{/if}
		</section>
	{/if}
</div>
