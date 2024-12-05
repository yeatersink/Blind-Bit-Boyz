<script lang="ts">
	const {data} = $props()
	let priceInfo= $state({});

	async function getPriceInfo() {
const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${data.data.result.contractAddress}`)
priceInfo = await response.json()
	}
</script>

{#if data.data.result}
	<h1>{data.data.result.name}</h1>
<p>Address: {data.data.result.contractAddress}</p>
<button onclick={() => navigator.clipboard.writeText(data.data.result.contractAddress)}>Copy Address</button>
<p>Symbol: {data.data.result.symbol}</p>
<p>Type: {data.data.result.type}</p>
<p>Decimals: {data.data.result.decimals}</p>
<p>Total Supply: {data.data.result.totalSupply}</p>
{/if}
<h2>Price Info</h2>
{#await getPriceInfo()}
	<p>loading...</p>
{:then}
{#if priceInfo}
	{JSON.stringify(priceInfo.pairs[0].baseToken.name)}
<br/>
	{JSON.stringify(priceInfo.pairs[0].quoteToken.name)}
<br/>
	{JSON.stringify(priceInfo.pairs[0].quoteToken.address)}
<br/>
	{JSON.stringify(priceInfo.pairs[0].priceUsd)}
{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}