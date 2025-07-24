<script lang="ts">
	import '@awesome.me/webawesome/dist/components/card/card.js';

	let {
		securityScore,
		onChainStrengthIndex
	}: {
		securityScore: number | null;
		onChainStrengthIndex: number | null;
	} = $props();
</script>

{#if securityScore || onChainStrengthIndex}
	<wa-card>
		<div slot="header">
			<h2>Health Metrics</h2>
		</div>
		{#if securityScore}
			<p>Security Score: {securityScore}/100</p>
		{/if}
		{#if onChainStrengthIndex}
			<p>On-Chain Strength Index: {onChainStrengthIndex}</p>
		{/if}
	</wa-card>
{/if}
