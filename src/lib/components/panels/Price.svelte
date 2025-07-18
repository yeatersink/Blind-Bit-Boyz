<script lang="ts">
	let {
		usd,
		native,
		priceChange
	}: { usd: number | null; native: number | null; priceChange: Record<string, number> | null } =
		$props();
</script>

{#if usd || native || priceChange}
	<wa-card>
		<div slot="header">
			<h2>Price Info</h2>
		</div>
		{#if usd}
			<p>USD: ${usd}</p>
		{/if}
		{#if native}
			<p>Native: {native}</p>
		{/if}
		{#if priceChange}
			<h3>Price Change</h3>
			{#each Object.keys(priceChange) as interval}
				{#if priceChange[interval]}
					<p>{interval}: {priceChange[interval]}%</p>
				{/if}
			{/each}
		{/if}
	</wa-card>
{/if}
