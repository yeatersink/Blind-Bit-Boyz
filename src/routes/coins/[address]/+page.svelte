<script lang="ts">
	let currentTab: string = $state('panel-coin-details');

	const { data } = $props();

	function formatNumberWithDecimals(number: string, decimals: string) {
		return (parseInt(number) / 10 ** parseInt(decimals)).toFixed(parseInt(decimals));
	}
</script>

<svelte:head>
	{#if data.coin}
		<title>{data.coin.name} ({data.coin.symbol})</title>
	{/if}
</svelte:head>

{#if data.coin}
	<h1>{data.coin.name}</h1>
{#if data.coin.imageUrl}
	<img src={data.coin.imageUrl} alt={`${data.coin.name} logo`} class="size-10" />
{/if}
	<p>{data.coin.address}</p>
	<button onclick={() => navigator.clipboard.writeText(data.coin.address)}
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
		<p>Symbol: {data.coin.symbol}</p>
		<p>Chain: {data.coin.chain}</p>
{#if data.coin.labels}
		{#each data.coin.labels as label}
		<p>{label}</p>
	{/each}
{/if}

{#if data.coin.pair}
		<h2>Pair Details</h2>
		<p>Pair Address: {data.coin.pair.pairAddress}</p>
		<button onclick={() => navigator.clipboard.writeText(data.coin.pair.pairAddress)}
			>Copy Address</button
		>
		<p>Pair created on: {new Date(data.coin.pair.pairCreated)}</p>
		<p>Paired with: {data.coin.pair.name}</p>
		<p>Paired token address: {data.coin.pair.address}</p>
		<button onclick={() => navigator.clipboard.writeText(data.coin.pair.address)}
			>Copy Address</button
		>
		<p>Paired token symbol: {data.coin.pair.symbol}</p>
{/if}

		<h2>Price Details</h2>
		<p>${data.coin.priceUSD}</p>
		<p>Native: {data.coin.priceNative}</p>
		<h3>Liquidity</h3>
		<p>${data.coin.liquidity}</p>
{#if data.coin.fdv}
<h3>FDV</h3>
		<p>${data.coin.fdv}</p>
{/if}
{#if data.coin.marketCap}
		<h3>Market Cap</h3>
		<p>${data.coin.marketCap}</p>
{/if}
{#if data.coin.volume}
		<h3>Volume</h3>
{#each Object.keys(data.coin.volume) as key}
	<p>{key}: {data.coin.volume[key]}</p>
{/each}
{/if}

{#if data.coin.transactions}
<h3>Buys</h3>
{#each Object.keys(data.coin.transactions) as key}
	<p>{key}: {data.coin.transactions[key].buys}</p>
{/each}
<h3>Sells</h3>
{#each Object.keys(data.coin.transactions) as key}
	<p>{key}: {data.coin.transactions[key].sells}</p>
{/each}
{/if}
{#if data.coin.contactInfo}
<h2>Contact Information:</h2>
{#if data.coin.contactInfo.websites}
{#each data.coin.contactInfo.websites as website}
<a href={website.url}>Website: {website.url}</a>
{/each}
{/if}
{#if data.coin.contactInfo.socials}
{#each data.coin.contactInfo.socials as social}
	<a href={social.url}>{social.type}</a>
{/each}
{/if}
{/if}
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