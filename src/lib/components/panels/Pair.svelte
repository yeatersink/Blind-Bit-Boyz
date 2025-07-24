<script lang="ts">
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
	import { chains, getChainKeyByMoralisId } from '$lib/utils/chains';

	let {
		baseTokenAddress,
		symbol,
		label,
		pairAddress,
		chainHexId,
		createdAt
	}: {
		baseTokenAddress: string;
		symbol: string;
		label: string;
		pairAddress: string;
		chainHexId: string;
		createdAt: string;
	} = $props();

	let ageInDays: number = $derived.by(() => {
		if (createdAt) {
			const createdDate = new Date(createdAt);
			const currentDate = new Date();
			const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
		}
		return 0;
	});
</script>

{#if baseTokenAddress || symbol || label || pairAddress || chainHexId || ageInDays}
	<wa-card>
		<div slot="header">
			<h2>Pair Info</h2>
		</div>
		{#if baseTokenAddress}
			<p>Base Token Address: {baseTokenAddress}</p>
			<wa-copy-button value={baseTokenAddress}></wa-copy-button>
		{/if}
		{#if symbol}
			<p>Base Token Symbol: {symbol}</p>
		{/if}
		{#if label}
			<p>Label: {label}</p>
		{/if}
		{#if pairAddress}
			<p>Pair Address: {pairAddress}</p>
			<wa-copy-button value={pairAddress}></wa-copy-button>
		{/if}
		{#if chainHexId}
			<p>Chain: {chains[getChainKeyByMoralisId(chainHexId)].name || chainHexId}</p>
		{/if}
		{#if ageInDays}
			<p>Age: {ageInDays} days</p>
		{/if}
	</wa-card>
{/if}
