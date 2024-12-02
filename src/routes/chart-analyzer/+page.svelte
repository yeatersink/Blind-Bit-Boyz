<script lang="ts">
	import { onMount } from 'svelte';
	let query = '';
	let results: Array<any> = [];
	let blockchainList = [
		{ name: 'Ethereum', value: 'eth' },
		{ name: 'Pulse Chain', value: 'pls' }
	];
	let currentBlockchain: string = 'ethereum';

	async function searchCryptocurrencies() {
		const response = await fetch(
			`https://api.dexscreener.com/latest/dex/search?${currentBlockchain}/${query}`
		);
		console.log(response);
		const data = await response.json();
		results = data.pairs;
	}
</script>

<svelte:head>
	<title>Welcome to the Chart Analyzer.</title>
</svelte:head>

<h1>Chart Analyzer</h1>
<form on:submit|preventDefault={searchCryptocurrencies}>
	<label for="provider">Choose Your Data Provider</label>
	<select id="provider">
		<option value="dexscreener">Dex Screener</option>
		<option disabled value="dextools">Dex Tools</option>
		<option disabled value="coingecko">Coin Gecko</option>
		<option disabled value="coinbase">Coin Base</option>
	</select>
	<br />
	<label for="blockchain">Choose Which Block Chain You Want to Search</label>
	<select id="blockchain" bind:value={currentBlockchain}>
		{#each blockchainList as blockchain}
			<option value={blockchain.value}>{blockchain.name}</option>
		{/each}
	</select>
	<br />
	<label for="search">Search Cryptocurrencies</label>
	<input id="search" type="text" bind:value={query} placeholder="Enter cryptocurrency name" />
	<button type="submit">Search</button>
</form>

{#if results?.length > 0}
	<h2>Results: {results.length}</h2>
	<ul>
		{#each results as result}
			<li>
				{result.baseToken.name} ({result.baseToken.symbol}) {result.baseToken.address} / {result
					.quoteToken.name} ({result.quoteToken.symbol}) / {result.pairAddress} ${result.priceUsd}
			</li>
		{/each}
	</ul>
{/if}
