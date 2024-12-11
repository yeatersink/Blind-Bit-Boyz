<script lang="ts">
	import Page from "../../+page.svelte";

	let currentTab:string=$state('panel-coin-details');

	const {data} = $props()
	let priceInfo:any|undefined= $state(undefined);

	async function getPriceInfo() {
const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${data.data.result.contractAddress}`)
priceInfo = await response.json()
	}

	function formatNumberWithDecimals(number:string, decimals:string) {
		    return (parseInt(number)/(10**parseInt(decimals))).toFixed(parseInt(decimals))
	}
</script>

<svelte:head>
	{#if data.data.result}
		<title>{data.data.result.name} - {data.data.result.symbol}</title>
	{/if}
</svelte:head>

{#if data.data.result}
	<h1>{data.data.result.name}</h1>
<p>Address: {data.data.result.contractAddress}</p>
<button onclick={() => navigator.clipboard.writeText(data.data.result.contractAddress)}>Copy Address</button>

		<div>
			<section role="tablist" class="flex">
					<button
						aria-selected={currentTab==='panel-coin-details'}
						aria-controls="panel-coin-details"
						tabindex={currentTab==='panel-coin-details'?0:-1}
						role="tab"
onclick={() => currentTab='panel-coin-details'}
>Details</button
					>
					<button
						aria-selected={currentTab==='panel-technical-analysis'}
						aria-controls="panel-technical-analysis"
						tabindex={currentTab==='panel-technical-analysis'?0:-1}
						role="tab"
onclick={() => currentTab='panel-technical-analysis'}
>Technical Analysis</button
					>
			</section>
		</div>

<div class={`${currentTab!='panel-coin-details'?'hidden':''}`} role="tabpanel" id="panel-coin-details" aria-label="Coin Details">
<p>Symbol: {data.data.result.symbol}</p>
<p>Type: {data.data.result.type}</p>
<p>Decimals: {data.data.result.decimals}</p>
<p>Total Supply: {formatNumberWithDecimals(data.data.result.totalSupply,data.data.result.decimals)}</p>

<h2>Price Info</h2>
{#await getPriceInfo()}
	<p>loading...</p>
{:then}
{#if priceInfo}
	{#if priceInfo.pairs[0].priceUsd}
	<p>${priceInfo.pairs[0].priceUsd}</p>
{/if}
{/if}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
</div>
<div class={`${currentTab!='panel-technical-analysis'?'hidden':''}`} role="tabpanel" id="panel-technical-analysis" aria-label="Technical Analysis">
<p>Chart Goes Here</p>
</div>
{/if}