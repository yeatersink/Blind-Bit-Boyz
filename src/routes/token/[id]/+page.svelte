<script lang="ts">
	import AccessTabs from '$lib/components/AccessTabs.svelte';
	import type { PageOverview } from '$lib/utils/overview';

	const { data } = $props();
	let tab = $state('overview');
	let activeOnly = $state(true);

	const overview = $derived(data.overview as PageOverview | null);
	const name = $derived(overview?.name || '');
	const pools = $derived(
		(overview?.pools ?? []).filter((pool) => (activeOnly ? pool.active : true))
	);

	function copy(value: string) {
		void navigator.clipboard.writeText(value);
	}
</script>

<svelte:head>
	<title>{name || 'Data not available'}</title>
</svelte:head>

{#if overview && name}
	<h1>{name}</h1>
	<p role="status">{name} overview loaded.</p>
{:else}
	<h1>Data not available</h1>
	<p role="alert">{data.error || 'Data not available'}</p>
{/if}

<AccessTabs
	label="Token sections"
	bind:active={tab}
	tabs={[
		{ id: 'overview', label: 'Overview' },
		{ id: 'pairs', label: 'Pairs' },
		{ id: 'technical-analysis', label: 'Technical Analysis' }
	]}
/>

<div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" hidden={tab !== 'overview'}>
	{#if overview}
		<table>
			<tbody>
				{#each overview.rows as item (item.label)}
					<tr>
						<th scope="row">{item.label}</th>
						<td>{item.value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if overview.tokenAddress}
			<button type="button" onclick={() => copy(overview.tokenAddress || '')}>
				Copy contract address
			</button>
		{/if}
		{#if overview.pairAddress}
			<button type="button" onclick={() => copy(overview.pairAddress || '')}>
				Copy pair address
			</button>
		{/if}
	{/if}
</div>

<div role="tabpanel" id="panel-pairs" aria-labelledby="tab-pairs" hidden={tab !== 'pairs'}>
	<h2>Pairs</h2>
	<label>
		<input type="checkbox" bind:checked={activeOnly} />
		Only show active pairs
	</label>
	{#if pools.length > 0}
		<ul>
			{#each pools as pool (pool.pairAddress)}
				<li>
					<h3>
						<a href={`/pair/${pool.pairAddress}?chain=${pool.chainKey}`}>
							{pool.name}{pool.dex && pool.dex !== 'n/a' ? `, ${pool.dex}` : ''}
						</a>
					</h3>
					<p>Pair address: {pool.pairAddress}</p>
					<p>Liquidity: {pool.liquidityUsd}</p>
					<p>Volume: {pool.volume24hUsd}</p>
					<p>Price: {pool.priceUsd}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No pairs found for this token.</p>
	{/if}
</div>

<div
	role="tabpanel"
	id="panel-technical-analysis"
	aria-labelledby="tab-technical-analysis"
	hidden={tab !== 'technical-analysis'}
>
	<h2>Technical Analysis</h2>
	{#if tab === 'technical-analysis' && overview?.pairAddress}
		<p>Chart for {overview.pools[0]?.name || overview.pairAddress}.</p>
		{#await import('$lib/components/charts/Chart.svelte') then module}
			<module.default
				address={overview.pairAddress}
				name={overview.pools[0]?.name || name || overview.pairAddress}
				symbol={overview.symbol || 'Pair'}
				createdAt={overview.createdAt}
			/>
		{/await}
	{:else if tab === 'technical-analysis'}
		<p>Open a pair to view candlestick and line charts.</p>
	{/if}
</div>
