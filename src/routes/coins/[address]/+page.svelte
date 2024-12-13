<script lang="ts">
	let currentTab: string = $state('panel-coin-details');

	const { data } = $props();

	function formatNumberWithDecimals(number: string, decimals: string) {
		return (parseInt(number) / 10 ** parseInt(decimals)).toFixed(parseInt(decimals));
	}
</script>

<svelte:head>
	{#if data.pair}
		<title>{data.pair.baseToken.name} ({data.pair.baseToken.symbol})</title>
	{/if}
</svelte:head>

{#if data.pair}
	<h1>{data.pair.baseToken.name}</h1>
	<p>{data.pair.baseToken.address}</p>
	<button onclick={() => navigator.clipboard.writeText(data.pair.baseToken.address)}
		>Copy Address</button
	>
	<div>
		<section role="tablist" class="flex">
			<button
				aria-selected={currentTab === 'panel-coin-details'}
				aria-controls="panel-coin-details"
				tabindex={currentTab === 'panel-coin-details' ? 0 : -1}
				role="tab"
				onclick={() => (currentTab = 'panel-coin-details')}>Details</button
			>
			<button
				aria-selected={currentTab === 'panel-technical-analysis'}
				aria-controls="panel-technical-analysis"
				tabindex={currentTab === 'panel-technical-analysis' ? 0 : -1}
				role="tab"
				onclick={() => (currentTab = 'panel-technical-analysis')}>Technical Analysis</button
			>
		</section>
	</div>

	<div
		class={`${currentTab != 'panel-coin-details' ? 'hidden' : ''}`}
		role="tabpanel"
		id="panel-coin-details"
		aria-label="Coin Details"
	>
		<h2>Token Details</h2>
		<p>Symbol: {data.pair.baseToken.symbol}</p>
		<p>Chain: {data.pair.chainId}</p>
		<h2>Pair Details</h2>
		<p>Pair Address: {data.pair.pairAddress}</p>
		<button onclick={() => navigator.clipboard.writeText(data.pair.pairAddress)}
			>Copy Address</button
		>
		<p>Pair created on: {new Date(data.pair.pairCreatedAt)}</p>
		<p>Paired with: {data.pair.quoteToken.name}</p>
		<p>Paired token address: {data.pair.quoteToken.address}</p>
		<button onclick={() => navigator.clipboard.writeText(data.pair.quoteToken.address)}
			>Copy Address</button
		>
		<p>Paired token symbol: {data.pair.quoteToken.symbol}</p>
		<h2>Price Details</h2>
		<p>${data.pair.priceUsd}</p>
		<p>Native: {data.pair.priceNative}</p>
{#if data.pair.txns}
<h3>Buys</h3>
{#each Object.keys(data.pair.txns) as key}
	<p>{key}: {data.pair.txns[key].buys}</p>
{/each}
<h3>Sells</h3>
{#each Object.keys(data.pair.txns) as key}
	<p>{key}: {data.pair.txns[key].sells}</p>
{/each}
{/if}
<h3>Volume</h3>
{#each Object.keys(data.pair.volume) as key}
	<p>{key}: {data.pair.volume[key]}</p>
{/each}
	</div>
	<div
		class={`${currentTab != 'panel-technical-analysis' ? 'hidden' : ''}`}
		role="tabpanel"
		id="panel-technical-analysis"
		aria-label="Technical Analysis"
	>
		<p>Chart Goes Here</p>
	</div>
{/if}
