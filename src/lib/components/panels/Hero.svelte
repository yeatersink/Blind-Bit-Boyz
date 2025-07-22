<script lang="ts">
	import {
		formatCryptoPrice,
		formatLargeNumber,
		formatPercentage
	} from '$lib/utils/formatting.svelte';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/divider/divider.js';

	let {
		name,
		symbol,
		logo,
		usd,
		usdChange,
		marketCap,
		fullyDilutedValuation,
		volumeChange
	}: {
		name: string;
		symbol: string;
		logo: string;
		usd: number | null;
		usdChange: Record<string, number> | null;
		marketCap: number | null;
		fullyDilutedValuation: number | null;
		volumeChange: Record<string, number> | null;
	} = $props();
</script>

<wa-card>
	<div slot="header">
		<h1>{name} ({symbol})</h1>
	</div>
	{#if logo}
		<img class="h-16 w-16" slot="media" src={logo} alt="{name} logo" />
	{/if}
	{#if usd}
		<p>Current Price: {formatCryptoPrice(usd)}</p>
	{/if}
	{#if usdChange && usdChange['1d']}
		{#if usdChange['1d'] < 0}
			<div class="flex text-red-500">
				<span>Price Change (24h): {formatPercentage(usdChange['1d'])}</span>
				<wa-icon family="solid" name="arrow-down" label="Downwards arrow"></wa-icon>
			</div>
		{:else if usdChange['1d'] > 0}
			<div class="flex text-green-500">
				<span>Price Change (24h): {formatPercentage(usdChange['1d'])}</span>
				<wa-icon family="solid" name="arrow-up" label="Upwards arrow"></wa-icon>
			</div>
		{:else}
			<div class="flex text-gray-500">
				<span>Price Change (24h): {formatPercentage(usdChange['1d'])}</span>
				<wa-icon family="solid" name="minus" label="No Change"></wa-icon>
			</div>
		{/if}
	{/if}
	{#if marketCap}
		<p>Market Cap: {formatLargeNumber(marketCap, undefined, true, '$')}</p>
	{/if}
	{#if fullyDilutedValuation}
		<p>Fully Diluted Valuation: {formatLargeNumber(fullyDilutedValuation, undefined, true, '$')}</p>
	{/if}
	{#if volumeChange && volumeChange['1d']}
		{#if volumeChange['1d'] < 0}
			<div class="flex text-red-500">
				<span
					>Volume Change (24h): {formatLargeNumber(volumeChange['1d'], undefined, true, '$')}</span
				>
				<wa-icon family="solid" name="arrow-down" label="Downwards arrow"></wa-icon>
			</div>
		{:else if volumeChange['1d'] > 0}
			<div class="flex text-green-500">
				<span
					>Volume Change (24h): {formatLargeNumber(volumeChange['1d'], undefined, true, '$')}</span
				>
				<wa-icon family="solid" name="arrow-up" label="Upwards arrow"></wa-icon>
			</div>
		{:else}
			<div class="flex text-gray-500">
				<span
					>Volume Change (24h): {formatLargeNumber(volumeChange['1d'], undefined, true, '$')}</span
				>
				<wa-icon family="solid" name="minus" label="No Change"></wa-icon>
			</div>
		{/if}
	{/if}
</wa-card>
<wa-divider></wa-divider>
