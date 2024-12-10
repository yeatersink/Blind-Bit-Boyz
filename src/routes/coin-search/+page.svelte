<script lang="ts">
	import { goto } from '$app/navigation';
	let query = '';
	let results: Array<any> = [];
let prices:{[key:string]:{price:string; name:string}} = {}
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
	try {
		const response = await fetch(
			`https://api.scan.pulsechain.com/api/v2/search?q=${query}`
		);
		const data = await response.json();
	let itemList = [];
	if(data.items.length>30) {
//Splits items into groups of 30
for(let i = 0; i < data.items.length; i+=30) {
itemList.push(data.items.slice(i, i+30))
}
//Get price info for each group of 30 items
for(let items of itemList) {
await getPriceInfo(items)
}
	} else {
await getPriceInfo(data.items);
	}
		results = data.items;
	} catch (error) {
console.error('Error fetching data from Pulse Chain API');
		console.error(error);
	}
	}

	async function getPriceInfo(items:Array<any>) {
	try {
	const contractAddresses = items.map((item) => item.address)
const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddresses.join(',')}`)
const priceInfoList = await response.json()
	for(let priceInfo of priceInfoList.pairs) {
	if(priceInfo.priceUsd) {
		prices[priceInfo.baseToken.address] = {price:`$${priceInfo.priceUsd}`,name:priceInfo.baseToken.name}
	} else {
		prices[priceInfo.baseToken.address] = {price:'N/A',name:priceInfo.baseToken.name}
	}
	}
	} catch (error) {
console.error('Error fetching price info from Dex Screener API');
		console.error(error);
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

{#if results?.length > 0}
	<h2>Results: {results.length}</h2>
	<ul>
		{#each results as result}
			<li>
<a href={`/coins/${result.address}`} target="_blank">
				<h3>{result.name}</h3>
{#if prices[result.address]}
<p>Price: {prices[result.address].price}</p>
{:else}
<p>Price: N/A</p>
{/if}
				<p>{result.address}</p>
</a>
			</li>
		{/each}
	</ul>
{/if}
