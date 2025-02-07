<script lang="ts">
	import { request, gql } from 'graphql-request';
	import { page } from '$app/stores';
	let currentTab: string = $state('panel-coin-details');

	const { data } = $props();

	function formatNumberWithDecimals(number: string, decimals: string) {
		return (parseInt(number) / 10 ** parseInt(decimals)).toFixed(parseInt(decimals));
	}

	async function getTechnicalAnalysis() {
		const dataProvider = $page.url.searchParams.get('dataProvider');
		const coinAddress = $page.url.pathname.split('/')[2];
		if (dataProvider == 'pulse') {
			const endPoint = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex';
			if (data.coin?.pair) {
				const gqlQuery = gql`
					query GetTokenTA($address: String!) {
						pairDayDatas(
							where: { pairAddress: $address }
							first: 100
							orderBy: "date"
							orderDirection: "desc"
						) {
							id
							date
							dailyVolumeToken0
							dailyTxns
							reserveUSD
						}
					}
				`;
				const variables = {
					address: data.coin.pair.pairAddress
				};

				try {
					const response: any = await request(endPoint, gqlQuery, variables);
					if (response.pairDayDatas) {
						let taObject = response.pairDayDatas.map((day: any) => {
							return {
								date: day.date,
								priceUSD: day.reserveUSD,
								dailyTxns: day.dailyTxns,
								dailyVolumeToken0: day.dailyVolumeToken0
							};
						});
						return taObject;
					} else {
						return { message: 'Sorry that Token is not Found!' };
					}
				} catch (error) {
					console.error(error);
					return { message: 'Sorry something went wrong!' };
				}
			} else {
				const gqlQuery = gql`
					query GetTokenTA($address: String!) {
						tokenDayData(id: $address, first: 100, orderBy: "date", orderDirection: "desc") {
							id
							date
							dailyVolumeToken
							dailyVolumePLS
							dailyVolumeUSD
							dailyTxns
							totalLiquidityToken
							totalLiquidityPLS
							totalLiquidityUSD
							priceUSD
						}
					}
				`;
				const variables = {
					address: coinAddress
				};

				try {
					const response: any = await request(endPoint, gqlQuery, variables);
					if (response.token) {
						return response.token.tokenDayData;
					} else {
						return { message: 'Sorry that Token is not Found!' };
					}
				} catch (error) {
					console.error(error);
					return { message: 'Sorry something went wrong!' };
				}
			}
		} else {
			return { message: 'Sorry that Data Provider is not Supported at this Time!' };
		}
	}
</script>

<svelte:head>
	{#if data.coin}
		<title>{data.coin.name} ({data.coin.symbol})</title>
	{/if}
</svelte:head>

{#if data.coin}
	<h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">{data.coin.name}</h1>
	{#if data.coin.imageUrl}
		<img src={data.coin.imageUrl} alt={`${data.coin.name} logo`} class="size-10" />
	{/if}
	<div class="flex items-center justify-between">
		<p>{data.coin.address}</p>
		<button
			class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
			onclick={() => navigator.clipboard.writeText(data.coin.address)}
			aria-label="Copy token Address"><span class="fa-solid fa-copy"></span></button
		>
	</div>
	<div>
		<section role="tablist" class="flex border-b border-gray-700">
			<button
				class="border-b-2 border-transparent bg-gray-900 px-4 py-2 text-gray-300 hover:border-gold-500 focus:outline-none aria-selected:border-gold-500 aria-selected:bg-black aria-selected:font-bold aria-selected:text-gold-500"
				aria-selected={currentTab === 'panel-coin-details'}
				aria-controls="panel-coin-details"
				tabindex={currentTab === 'panel-coin-details' ? 0 : -1}
				role="tab"
				onclick={() => (currentTab = 'panel-coin-details')}>Details</button
			>
			<button
				class="border-b-2 border-transparent bg-gray-900 px-4 py-2 text-gray-300 hover:border-gold-500 focus:outline-none aria-selected:border-gold-500 aria-selected:bg-black aria-selected:font-bold aria-selected:text-gold-500"
				aria-selected={currentTab === 'panel-technical-analysis'}
				aria-controls="panel-technical-analysis"
				tabindex={currentTab === 'panel-technical-analysis' ? 0 : -1}
				role="tab"
				onclick={() => (currentTab = 'panel-technical-analysis')}>Technical Analysis</button
			>
		</section>
	</div>

	<div
		class={`${currentTab != 'panel-coin-details' ? 'hidden' : ''} bg-gray-800 p-4`}
		role="tabpanel"
		id="panel-coin-details"
		aria-label="Coin Details"
	>
		<h2 class="mb-4 text-2xl font-semibold text-gray-100">Token Details</h2>
		<p>Symbol: {data.coin.symbol}</p>
		{#if data.coin.totalSupply && data.coin.decimals}
			<p>
				Total supply: {formatNumberWithDecimals(
					data.coin.totalSupply.toString(),
					data.coin.decimals.toString()
				)}
			</p>
		{/if}
		<p>Chain: {data.coin.chain}</p>
		{#if data.coin.labels}
			{#each data.coin.labels as label}
				<p>{label}</p>
			{/each}
		{/if}

		{#if data.coin.pair}
			<h2 class="mb-4 text-2xl font-semibold text-gray-100">Pair Details</h2>
			<div class="flex items-center justify-between">
				<p>Pair Address: {data.coin.pair.pairAddress}</p>
				<button
					class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
					onclick={() => navigator.clipboard.writeText(data.coin.pair.pairAddress)}
					aria-label="Copy Pair Address"><span class="fa-solid fa-copy"></span></button
				>
			</div>
			<p>Pair created on: {new Date(data.coin.pair.pairCreated)}</p>
			<p>Paired with: {data.coin.pair.name}</p>
			<div class="flex items-center justify-between">
				<p>Paired token address: {data.coin.pair.address}</p>
				<button
					class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
					onclick={() => navigator.clipboard.writeText(data.coin.pair.address)}
					aria-label="Copy Paired Token Address"><span class="fa-solid fa-copy"></span></button
				>
			</div>
			<p>Paired token symbol: {data.coin.pair.symbol}</p>
		{/if}

		<h2 class="mb-4 text-2xl font-semibold text-gray-100">Price Details</h2>
		<p>${data.coin.priceUSD}</p>
		<p>Native: {data.coin.priceNative}</p>
		<h3 class="text-xl font-semibold">Liquidity</h3>
		<p>${data.coin.liquidity}</p>
		{#if data.coin.fdv}
			<h3 class="text-xl font-semibold">FDV</h3>
			<p>${data.coin.fdv}</p>
		{/if}
		{#if data.coin.marketCap}
			<h3 class="text-xl font-semibold">Market Cap</h3>
			<p>${data.coin.marketCap}</p>
		{/if}
		{#if data.coin.volume}
			<h3 class="text-xl font-semibold">Volume</h3>
			{#each Object.keys(data.coin.volume) as key}
				<p>{key}: {data.coin.volume[key]}</p>
			{/each}
		{/if}

		{#if data.coin.tradeVolume}
			<h3 class="text-xl font-semibold">Trade Volume</h3>
			<p>Trade Volume: {data.coin.tradeVolume}</p>
		{/if}
		{#if data.coin.tradeVolumeUSD}
			<p>Trade Volume USD: {data.coin.tradeVolumeUSD}</p>
		{/if}
		{#if data.coin.untrackedVolumeUSD}
			<p>Untracked Volume USD: {data.coin.untrackedVolumeUSD}</p>
		{/if}

		{#if data.coin.transactions || data.coin.totalTransactions}
			<h2 class="mb-4 text-2xl font-semibold text-gray-100">Transactions</h2>
			{#if data.coin.totalTransactions}
				<p>Total Transactions: {data.coin.totalTransactions}</p>
			{/if}

			{#if data.coin.transactions}
				<h3 class="text-xl font-semibold">Buys</h3>
				{#each Object.keys(data.coin.transactions) as key}
					<p>{key}: {data.coin.transactions[key].buys}</p>
				{/each}
				<h3 class="text-xl font-semibold">Sells</h3>
				{#each Object.keys(data.coin.transactions) as key}
					<p>{key}: {data.coin.transactions[key].sells}</p>
				{/each}
			{/if}
		{/if}

		{#if data.coin.contactInfo}
			<h2 class="mb-4 text-2xl font-semibold text-gray-100">Contact Information:</h2>
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
		class={`${currentTab != 'panel-technical-analysis' ? 'hidden' : ''} bg-gray-800 p-4`}
		role="tabpanel"
		id="panel-technical-analysis"
		aria-label="Technical Analysis"
	>
		<h2 class="mb-4 text-2xl font-semibold text-gray-100">Technical analysis</h2>
		{#await getTechnicalAnalysis()}
			<p>Loading...</p>
		{:then value}
			{#if value}
				{#if value.message}
					<p>{value.message}</p>
				{/if}
				{#each value as day}
					<h3>{new Date(day.date * 1000).toLocaleDateString()}:</h3>
					<p>${day.priceUSD}</p>
					<p>Transactions: {day.dailyTxns}</p>
				{/each}
			{/if}
		{:catch}
			<p>Sorry something went wrong!</p>
		{/await}
	</div>
{/if}
