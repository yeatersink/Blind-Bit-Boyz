<script lang="ts">
	import { goto } from '$app/navigation';
	let query =$state('');
type resultType = {
	name:string;
	symbol:string;
	address:string;
price:number|undefined;
exchangeRate?:number;
	chainId?:string;
	pairedToken?:{
pairAddress:string;
	name:string;
	symbol:string;
	address:string;
	}
};
	let results: Array<resultType>= $state([]);
let prices:{[key:string]:{price:string; name:string}} = {}
let dataProvidersList = [
		{ name: 'Dex Screener', value: 'dexscreener' },
		{name:'Pulsechain',value:'pulse'},
	];
	let currentDataProvider: string = $state(dataProvidersList[0].value);
	let blockchainList = [
		{ name: 'Pulse Chain', value: 'pls' },
	];
	let currentBlockchain: string = $state(blockchainList[0].value);

	async function searchCryptocurrencies() {
results = [];
if (currentDataProvider=="dexscreener"){
	searchDexscreener()
} else if(currentDataProvider=="pulse"){
	searchPulseChain()
}
	}

async function searchDexscreener(){
let data:any;
		//Checks if the user entered a contract address
		if(query.startsWith('0x') && query.length == 42){
		const response = await fetch(
			`https://api.dexscreener.com/latest/dex/tokens/${query}`
		);
		data = await response.json();
} else {
		const response = await fetch(
			`https://api.dexscreener.com/latest/dex/search?q=${currentBlockchain}/${query}`
		);
		data = await response.json();
}
for(let item of data.pairs) {
		results.push({
			name: item.baseToken.name,
			symbol: item.baseToken.symbol,
			address: item.baseToken.address,
			price: item.priceUsd,
chainId: item.chainId,
			pairedToken: {
pairAddress:item.pairAddress,
				name: item.quoteToken.name,
				symbol: item.quoteToken.symbol,
				address: item.quoteToken.address,
			},
		});
	}
	}


async function searchPulseChain() {
	let data:any;
	const response = await fetch(`https://api.scan.pulsechain.com/api/v2/tokens?q=${query}&type=ERC-20`)
		data = await response.json();
		let marketData:any;
		const marketResponse=await fetch("https://api.scan.pulsechain.com/api/v2/stats")
		marketData=marketResponse.json()
		let plsPrice:number|undefined=undefined;
if(marketData.coin_price) {
plsPrice=marketData.coin_price
}
	for (let item of data.items){
		results.push({name:item.name,symbol:item.symbol,address:item.address,price:plsPrice??0*item.exchange_rate,exchangeRate:item.exchange_rate})
	}
}


function getResultUrl(result:resultType){
	let url = result.address;
	if(result.chainId && result.pairedToken?.pairAddress) {
		url += `?chainId=${result.chainId}&pairAddress=${result.pairedToken.pairAddress}`;
}
	return url;
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
	<select id="provider" bind:value={currentDataProvider}>
		{#each dataProvidersList as provider}
			<option value={provider.value}>{provider.name}</option>
		{/each}
	</select>
	<br />
	<label for="blockchain">Choose Which Block Chain You Want to Search</label>
	<select id="blockchain" bind:value={currentBlockchain} disabled={currentDataProvider!== 'dexscreener'}>
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

{#if results.length > 0}
	<h2>Results: {results.length}</h2>
{#if currentDataProvider == 'pulse'}
	<p role="alert">The Pulsechain data provider intigration is currently still in development and not fully functional.</p>
{/if}
	<ul>
		{#each results as result}
			<li>
<a href={`/coins/${getResultUrl(result)}`} target="_blank">
				<h3>{result.name}: {result.price?'$'+result.price:'Price not available'}</h3>
{#if result.exchangeRate}
				<p>Exchange rate: {result.exchangeRate}</p>
{/if}
				<p>{result.address}</p>
</a>
			</li>
		{/each}
	</ul>
{/if}
