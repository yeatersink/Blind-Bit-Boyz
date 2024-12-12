<script lang="ts">
	import { goto } from '$app/navigation';
	let query =$state('');
	let results: any|undefined = $state(undefined);
let prices:{[key:string]:{price:string; name:string}} = {}
	let blockchainList = [
		{ name: 'Pulse Chain', value: 'pls' },
	];
	let currentBlockchain: string = $state(blockchainList[0].value);

	async function searchCryptocurrencies() {
		const response = await fetch(
			`https://api.dexscreener.com/latest/dex/search?q=${currentBlockchain}/${query}`
		);
		const data = await response.json();
//Checks if the user was searching for a token address
if(query.startsWith('0x') && query.length == 42){
		//Finds the token in the results
    let tokenList = data.pairs.filter((pair: any) => {
        return pair.baseToken.address == query;
    });
results = {pairs:tokenList}
} else {
results=data;
}
	}

</script>

<svelte:head>
	<title>Search for a Coin.</title>
</svelte:head>

<h1>Coin Search</h1>
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
	<input id="search" type="search" bind:value={query} placeholder="Enter cryptocurrency name" />
	<br />
	<button type="submit">Search</button>
</form>

{#if results?.pairs.length > 0}
	<h2>Results: {results.pairs.length}</h2>
	<ul>
		{#each results.pairs as result}
			<li>
<a href={`/coins/${result.quoteToken.address}?chainid=${result.chainId}&pairid=${result.pairAddress}`} target="_blank">
				<h3>{result.baseToken.name} ${result.priceUsd} - ({result.quoteToken.name})</h3>
				<p>{result.baseToken.address}</p>
</a>
			</li>
		{/each}
	</ul>
{/if}
