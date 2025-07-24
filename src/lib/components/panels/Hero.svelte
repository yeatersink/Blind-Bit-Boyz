<script lang="ts">
	import {
		formatCryptoPrice,
		formatLargeNumber,
		formatPercentage
	} from '$lib/utils/formatting.svelte';
	import type { SearchType } from '$lib/utils/saved.svelte';
	import '@awesome.me/webawesome/dist/components/card/card.js';
	import '@awesome.me/webawesome/dist/components/divider/divider.js';
	import Bookmark from '../SavedSearches/Bookmark.svelte';

	let {
		address,
		name,
		chainId,
		symbol,
		logo,
		usd,
		usdChange,
		marketCap,
		fullyDilutedValuation,
		volumeChange,
		type
	}: {
		address: string;
		name: string;
		chainId: string;
		symbol: string;
		logo: string;
		usd: number | null;
		usdChange: Record<string, number> | null;
		marketCap: number | null;
		fullyDilutedValuation: number | null;
		volumeChange: Record<string, number> | null;
		type: SearchType;
	} = $props();

	let usd24h: number | null = $derived.by(() => {
		if (usdChange) {
			if (usdChange['1d']) {
				return usdChange['1d'];
			} else if (usdChange['24h']) {
				return usdChange['24h'];
			} else {
				return null;
			}
		}
		return null;
	});
	let volume24h: number | null = $derived.by(() => {
		if (volumeChange) {
			if (volumeChange['1d']) {
				return volumeChange['1d'];
			} else if (volumeChange['24h']) {
				return volumeChange['24h'];
			} else {
				return null;
			}
		}
		return null;
	});
</script>

<wa-card>
	<div slot="header" class="flex items-center justify-between">
		<h1>{name} ({symbol})</h1>
		<Bookmark {address} {name} {chainId} {type} />
	</div>
	{#if logo}
		<img class="h-16 w-16" slot="media" src={logo} alt="{name} logo" />
	{/if}
	{#if usd}
		<p>Current Price: {formatCryptoPrice(usd)}</p>
	{/if}
	{#if usd24h}
		{@render percentageChange('Price Change (24h)', usd24h)}
	{/if}
	{#if marketCap}
		<p>Market Cap: {formatLargeNumber(marketCap, undefined, true, '$')}</p>
	{/if}
	{#if fullyDilutedValuation}
		<p>Fully Diluted Valuation: {formatLargeNumber(fullyDilutedValuation, undefined, true, '$')}</p>
	{/if}
	{#if volume24h}
		{@render largeNumberChange('Volume Change (24h)', volume24h)}
	{/if}
</wa-card>
<wa-divider></wa-divider>

{#snippet largeNumberChange(text: string, number: number)}
	{#if number < 0}
		<div class="flex text-red-500">
			<span>{text}: {formatLargeNumber(number, undefined, true, '$')}</span>
			<wa-icon family="solid" name="arrow-down" label="Downwards arrow"></wa-icon>
		</div>
	{:else if number > 0}
		<div class="flex text-green-500">
			<span>{text}: {formatLargeNumber(number, undefined, true, '$')}</span>
			<wa-icon family="solid" name="arrow-up" label="Upwards arrow"></wa-icon>
		</div>
	{:else}
		<div class="flex text-gray-500">
			<span>{text}: {formatLargeNumber(number, undefined, true, '$')}</span>
			<wa-icon family="solid" name="minus" label="No Change"></wa-icon>
		</div>
	{/if}
{/snippet}

{#snippet percentageChange(text: string, number: number)}
	{#if number < 0}
		<div class="flex text-red-500">
			<span>{text}: {formatPercentage(number)}</span>
			<wa-icon family="solid" name="arrow-down" label="Downwards arrow"></wa-icon>
		</div>
	{:else if number > 0}
		<div class="flex text-green-500">
			<span>{text}: {formatPercentage(number)}</span>
			<wa-icon family="solid" name="arrow-up" label="Upwards arrow"></wa-icon>
		</div>
	{:else}
		<div class="flex text-gray-500">
			<span>{text}: {formatPercentage(number)}</span>
			<wa-icon family="solid" name="minus" label="No Change"></wa-icon>
		</div>
	{/if}
{/snippet}
