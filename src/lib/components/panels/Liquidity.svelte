<script lang="ts">
	let {
		liquidityLockedInPercent,
		liquidityChangeUsd
	}: {
		liquidityLockedInPercent: number | null;
		liquidityChangeUsd: Record<string, number> | null;
	} = $props();
</script>

{#if liquidityLockedInPercent || liquidityChangeUsd}
	<wa-card>
		<div slot="header">
			<h2>Liquidity</h2>
		</div>
		{#if liquidityLockedInPercent}
			<p>Liquidity locked in: ${liquidityLockedInPercent}%</p>
		{/if}
		{#if liquidityChangeUsd}
			<h3>Liquidity Change</h3>
			{#each Object.keys(liquidityChangeUsd) as interval}
				{#if liquidityChangeUsd[interval]}
					<p>{interval}: {liquidityChangeUsd[interval]}%</p>
				{/if}
			{/each}
		{/if}
	</wa-card>
{/if}
