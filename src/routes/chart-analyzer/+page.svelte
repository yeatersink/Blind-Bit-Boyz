<script lang="ts">
	import { goto } from '$app/navigation';
	let query = '';
	let results: Array<any> = [];
	let blockchainList = [
		{ name: 'Pulse Chain', value: 'pls' },
	];
	let currentBlockchain: string = blockchainList[0].value;

	async function searchCryptocurrencies() {
if(currentBlockchain === 'pls'){
getPulseChainData()
} else {
		const response = await fetch(
			`https://api.dexscreener.com/latest/dex/search?q=${currentBlockchain}/${query}`
		);
		const data = await response.json();
}
	}

	async function getPulseChainData() {
		const response = await fetch(
			`https://api.scan.pulsechain.com/api/v2/search?q=${query}`
		);
		const data = await response.json();
		results = data.items;
	}
</script>

<svelte:head>
	<title>Welcome to the Chart Analyzer.</title>
</svelte:head>

<h1>Chart Analyzer</h1>
<form onsubmit={(event) => {
event.preventDefault()
searchCryptocurrencies()
}}>
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
	<br />
	<button type="submit">Search</button>
</form>

{#if results?.length > 0}
	<h2>Results: {results.length}</h2>
	<ul>
		{#each results as result}
			<li>
<button onclick={() => goto(`/coins/${result.address}`)}>
				<h3>{result.name}</h3>
				<p>{result.address}</p>
</button>
			</li>
		{/each}
	</ul>
{/if}
