<script lang="ts">
	import Rich from '$lib/i18n/Rich.svelte';
	import { t } from '$lib/i18n/preferences.svelte';
	import type { Block } from '$lib/i18n/blocks';

	let { items }: { items: Block[] } = $props();
</script>

{#each items as block, index (index)}
	{#if block.t === 'h1'}
		<h1><Rich text={t(block.k)} /></h1>
	{:else if block.t === 'p'}
		<p><Rich text={t(block.k)} /></p>
	{:else if block.t === 'h2'}
		<h2><Rich text={t(block.k)} /></h2>
	{:else if block.t === 'h3'}
		<h3><Rich text={t(block.k)} /></h3>
	{:else if block.t === 'h4'}
		<h4><Rich text={t(block.k)} /></h4>
	{:else if block.t === 'year'}
		<div class="year-row year-row-inline">
			<p class="year-mark">{block.text}</p>
			<span class="chapter-rule" aria-hidden="true"></span>
		</div>
	{:else if block.t === 'ul'}
		<ul>
			{#each block.items as key, itemIndex (itemIndex)}
				<li><Rich text={t(key)} /></li>
			{/each}
		</ul>
	{:else if block.t === 'ol'}
		<ol>
			{#each block.items as key, itemIndex (itemIndex)}
				<li><Rich text={t(key)} /></li>
			{/each}
		</ol>
	{:else if block.t === 'table'}
		<div class="learn-table">
			<table>
				<caption><Rich text={t(block.caption)} /></caption>
				<thead>
					<tr>
						{#each block.head as key, headIndex (headIndex)}
							<th scope="col"><Rich text={t(key)} /></th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each block.rows as row, rowIndex (rowIndex)}
						<tr>
							{#each row as cell, cellIndex (cellIndex)}
								{#if cell.th}
									<th scope="row"><Rich text={t(cell.k)} /></th>
								{:else}
									<td><Rich text={t(cell.k)} /></td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/each}
