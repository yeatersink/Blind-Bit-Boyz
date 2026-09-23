<script lang="ts">
	import AccessTabs from '$lib/components/AccessTabs.svelte';
	import type { PageOverview } from '$lib/utils/overview';

	const { data } = $props();
	let tab = $state('overview');

	const overview = $derived(data.overview as PageOverview | null);
	const name = $derived(overview?.name || '');
	const pairAddress = $derived(overview?.pairAddress || data.pairAddress || '');

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
	label="Pair sections"
	bind:active={tab}
	tabs={[
		{ id: 'overview', label: 'Overview' },
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
		{#if pairAddress}
			<button type="button" onclick={() => copy(pairAddress)}>Copy pair address</button>
		{/if}
	{/if}
</div>

<div
	role="tabpanel"
	id="panel-technical-analysis"
	aria-labelledby="tab-technical-analysis"
	hidden={tab !== 'technical-analysis'}
>
	<h2>Technical Analysis</h2>
	<p>You can change any of the below options to change the data displayed in the charts.</p>
	{#if tab === 'technical-analysis' && pairAddress}
		{#await import('$lib/components/charts/Chart.svelte') then module}
			<module.default
				address={pairAddress}
				name={name || pairAddress}
				symbol={overview?.symbol || 'Pair'}
				createdAt={overview?.createdAt ?? null}
			/>
		{/await}
	{/if}
</div>
