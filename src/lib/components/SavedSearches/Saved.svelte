<script lang="ts">
	import { chains, getChainKeyByMoralisId, getChainNameByMoralisId } from '$lib/utils/chains';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import { savedSearchService } from '$lib/utils/saved.svelte';
	import Bookmark from './Bookmark.svelte';
	import Trash from './Trash.svelte';
</script>

{#if savedSearchService.count > 0}
	<ul class="mx-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each savedSearchService.list() as search}
			<li>
				<wa-card>
					<div slot="header" class="flex items-center justify-between">
						<wa-button
							appearance="plain"
							href={`/${search.type}/${search.address}?chain=${search.chainId}`}
						>
							<h3>{search.name}</h3>
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
