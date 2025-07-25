<script lang="ts">
	import { chains, getChainKeyByMoralisId, getChainNameByMoralisId } from '$lib/utils/chains';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import '@awesome.me/webawesome/dist/components/radio-group/radio-group.js';
	import { savedSearchService, type SavedSearch, type SearchType } from '$lib/utils/saved.svelte';
	import Bookmark from './Bookmark.svelte';
	import Trash from './Trash.svelte';

	type TypeIndex = SearchType | 'all';
	let currentType: TypeIndex = $state('all');
	let types: Record<TypeIndex, string> = {
		all: 'All',
		pair: 'Pairs',
		token: 'Tokens'
	};
	let filteredSearches: SavedSearch[] = $derived.by(() => {
		return savedSearchService.list().filter(filterByType);
	});

	function filterByType(search: SavedSearch) {
		if (currentType === 'all') return true;
		return search.type === currentType;
	}
</script>

{#if savedSearchService.count > 0}
	<wa-radio-group
		label="View"
		hint="Select what type of search you want to view."
		orientation="horizontal"
		value={currentType}
		defaultValue={currentType}
		onchange={(e: any) => {
			currentType = e.target.value as TypeIndex;
		}}
	>
		{#each Object.entries(types) as [type, label]}
			<wa-radio appearance="button" value={type}>{label}</wa-radio>
		{/each}
	</wa-radio-group>

	{#if filteredSearches.length > 0}
		<ul class="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredSearches as search}
				<li>
					<wa-card>
						<div slot="header" class="flex items-center justify-between">
							<wa-button
								appearance="plain"
								href={`/${search.type}/${search.address}?chain=${search.chainId}`}
							>
								<h3>{search.name} ({search.type})</h3>
							</wa-button>

							<Trash address={search.address} chainId={search.chainId} />
						</div>
						<p>Address: {search.address}</p>
						<wa-copy-button value={search.address}></wa-copy-button>
						<p>Chain: {getChainNameByMoralisId(search.chainId) ?? search.chainId}</p>
					</wa-card>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No saved searches found.</p>
	{/if}
{:else}
	<p>You have no saved searches. Add a new search to get started.</p>
{/if}
