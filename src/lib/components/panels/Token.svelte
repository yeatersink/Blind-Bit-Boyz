<script lang="ts">
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import { chains, getChainKeyByMoralisId } from '$lib/utils/chains';

	let {
		address,
		symbol,
		chainHexId,
		ageInDays
	}: { address: string; symbol: string; chainHexId: string; ageInDays: number } = $props();
</script>

{#if address || symbol || chainHexId || ageInDays}
	<wa-card>
		<div slot="header">
			<h2>Token Info</h2>
		</div>
		{#if address}
			<p>Address: {address}</p>
			<wa-copy-button value={address}></wa-copy-button>
		{/if}
		{#if symbol}
			<p>Symbol: {symbol}</p>
		{/if}
		{#if chainHexId}
			<p>Chain: {chains[getChainKeyByMoralisId(chainHexId)].name || chainHexId}</p>
		{/if}
		{#if ageInDays}
			<p>Age: {ageInDays} days</p>
		{/if}
	</wa-card>
{/if}
