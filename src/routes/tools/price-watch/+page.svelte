<script lang="ts">
	import { onMount } from 'svelte';
	import {
		API_UNREACHABLE,
		checkHealth,
		getChains,
		getMe,
		listWatches,
		PriceWatchApiError,
		publicErrorMessage,
		readStoredToken,
		type PriceWatchChain,
		type SavedWatch
	} from '$lib/priceWatchApi';

	let watches = $state<SavedWatch[] | null>(null);
	let chains = $state<PriceWatchChain[]>([]);
	let loading = $state(true);
	let signedIn = $state(false);
	let error = $state('');

	function chainLabel(chainId: string): string {
		const chain = chains.find((item) => item.chain_id === chainId);
		if (chain) return chain.name;
		return `Chain ${chainId}`;
	}

	onMount(() => {
		void (async () => {
			try {
				await checkHealth();
			} catch {
				error = API_UNREACHABLE;
				loading = false;
				return;
			}
			const token = readStoredToken();
			if (!token) {
				loading = false;
				return;
			}
			try {
				const me = await getMe(token);
				signedIn = true;
				const [catalog, saved] = await Promise.all([
					getChains().catch(() => [] as PriceWatchChain[]),
					listWatches(token, me.user.telegram_id)
				]);
				chains = catalog;
				watches = saved;
			} catch (caught) {
				if (caught instanceof PriceWatchApiError && caught.status === 401) {
					signedIn = false;
					watches = null;
					return;
				}
				error = publicErrorMessage(caught, token);
			} finally {
				loading = false;
			}
		})();
	});
</script>

<svelte:head>
	<title>Saved price watches — Blind Bit Boys</title>
	<meta
		name="description"
		content="Saved price-watch tokens, listed alphabetically by symbol."
	/>
</svelte:head>

<h1>Saved price watches</h1>
<p>
	Saved tokens are listed alphabetically by symbol. Alerts and watch settings stay on the
	<a class="story-link" href="/price-watch">Blind Bit Boys Price Watch Bot</a>.
</p>
<noscript>
	<p>This page needs JavaScript to load saved watches.</p>
</noscript>

{#if loading}
	<p role="status">Loading saved watches.</p>
{:else if error}
	<p role="alert">{error}</p>
{:else if !signedIn}
	<p>Sign in to load your saved watches.</p>
	<p>
		<a class="story-link" href="/price-watch">Sign in on Blind Bit Boys Price Watch Bot</a>
	</p>
{:else if watches && watches.length === 0}
	<p>You have no saved watches yet.</p>
{:else if watches}
	<ul>
		{#each watches as watch (watch.id)}
			<li>
				<h2>{watch.symbol}</h2>
				<p>Name: {watch.name}</p>
				<p>Chain: {chainLabel(watch.chain_id)}</p>
				<p class="pair">Pair address: {watch.pair_address}</p>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.pair {
		overflow-wrap: anywhere;
	}
</style>
