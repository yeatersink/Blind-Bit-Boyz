<script lang="ts">
	import { chains, getChainKeyByMoralisId, getChainNameByMoralisId } from '$lib/utils/chains';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import { savedSearchService, type SavedSearch, type SearchType } from '$lib/utils/saved.svelte';
	import Bookmark from './Bookmark.svelte';
	import Trash from './Trash.svelte';

	type TypeIndex = SearchType | 'all';
	let currentType = $state<TypeIndex>('all');
	const filters: { value: TypeIndex; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'token', label: 'Tokens' },
		{ value: 'pair', label: 'Pairs' }
	];
	let filteredSearches: SavedSearch[] = $derived.by(() => {
		return savedSearchService.list().filter(filterByType);
	});

	function filterByType(search: SavedSearch) {
		if (currentType === 'all') return true;
		return search.type === currentType;
	}

	function chooseFilter(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (value === 'all' || value === 'token' || value === 'pair') currentType = value;
	}
</script>

{#if savedSearchService.count > 0}
	<fieldset class="bookmark-filter">
		<legend>Show</legend>
		<div class="bookmark-options">
			{#each filters as filter (filter.value)}
				<label class="bookmark-option">
					<input
						type="radio"
						name="bookmark-filter"
						value={filter.value}
						checked={currentType === filter.value}
						onchange={chooseFilter}
					/>
					<span>{filter.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>

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
	<p id="bookmark-empty" tabindex="-1">You have no saved searches. Add a new search to get started.</p>
{/if}

<style>
	.bookmark-filter {
		margin: 0 0 1.25rem;
		padding: 0;
		border: 0;
		min-inline-size: 0;
	}

	.bookmark-filter legend {
		margin: 0 0 0.35rem;
		padding: 0;
		color: #f3f4f6;
		font-weight: 700;
	}

	.bookmark-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		align-items: center;
		position: static;
	}

	.bookmark-option {
		display: inline-flex;
		align-items: center;
		position: static;
		width: auto;
		min-height: 2.5rem;
		margin: 0;
		color: #f3f4f6;
	}

	.bookmark-option input {
		position: static;
		flex: 0 0 auto;
		width: 1.15rem;
		height: 1.15rem;
		margin: 0;
		appearance: auto;
		accent-color: #d4af37;
	}

	.bookmark-option span {
		margin-inline-start: 0.35rem;
		color: #f3f4f6;
	}

	.bookmark-option input:focus-visible {
		outline: 2px solid #e6c35c;
		outline-offset: 2px;
	}

	#bookmark-empty:focus {
		outline: 2px solid #e6c35c;
		outline-offset: 2px;
	}
</style>
