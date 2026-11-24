<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
	import {
		DOWN_THRESHOLD_HINT,
		PICK_CHAIN_MESSAGE,
		THRESHOLD_NEGATIVE_MESSAGE,
		PriceWatchApiError,
		RATIO_THRESHOLD_FIELDS,
		createRatioWatch,
		deleteRatioWatch,
		emptyRatioThresholds,
		getBestPair,
		getPairByAddress,
		isRatioDownThreshold,
		listRatioWatches,
		parseRatioThresholds,
		publicErrorMessage,
		ratioWatchesBySymbol,
		thresholdInputValue,
		tokenTitle,
		updateRatioWatch,
		watchDisplay,
		type BestPair,
		type RatioThresholdKey,
		type SavedRatioWatch
	} from '$lib/priceWatchApi';

	type Props = {
		chainId: string;
		token: string;
		chainLabel: (chainId: string) => string;
		onUnauthorized: () => void;
		onChainRequired: () => void;
	};

	let { chainId, token, chainLabel, onUnauthorized, onChainRequired }: Props = $props();

	let tokenA = $state('');
	let tokenB = $state('');
	let pairAddress = $state('');
	let ratioSource = $state<'tokens' | 'pair'>('tokens');
	let pairA = $state<BestPair | null>(null);
	let pairB = $state<BestPair | null>(null);
	let ratioResult = $state<BestPair | null>(null);
	let finding: 'a' | 'b' | 'ratio' | 'pair' | null = $state(null);
	let findError = $state('');
	let findStatus = $state('');

	let editing = $state<SavedRatioWatch | null>(null);
	let thresholdValues = $state(emptyRatioThresholds());
	let thresholdErrors = $state<Partial<Record<RatioThresholdKey, string>>>({});
	let formError = $state('');
	let formStatus = $state('');
	let saving = $state(false);

	let watches = $state<SavedRatioWatch[] | null>(null);
	let watchesLoading = $state(false);
	let watchesError = $state('');
	let listOpen = $state(false);
	let pendingRemove = $state<{ id: string; name: string; triggerId: string } | null>(null);
	let removeError = $state('');
	let removing = $state(false);
	let listSeq = 0;

	onMount(() => {
		void loadWatches(token, chainId);
	});

	function clearResolved() {
		tokenA = '';
		tokenB = '';
		pairAddress = '';
		ratioSource = 'tokens';
		pairA = null;
		pairB = null;
		ratioResult = null;
		finding = null;
		findError = '';
		findStatus = '';
		editing = null;
		thresholdValues = emptyRatioThresholds();
		thresholdErrors = {};
		formError = '';
		formStatus = '';
		pendingRemove = null;
		removeError = '';
	}

	async function focusId(id: string) {
		await tick();
		const node = document.getElementById(id);
		if (!(node instanceof HTMLElement)) return;
		node.focus();
		node.scrollIntoView({ block: 'nearest' });
	}

	function isLoginError(error: unknown): boolean {
		return error instanceof PriceWatchApiError && error.status === 401;
	}

	function usdText(value: string): string {
		if (!value) return 'not available';
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return 'not available';
		return formatCryptoPrice(numeric);
	}

	function symbolFor(address: string, pair: BestPair | null): string {
		if (!pair) return 'Token';
		const key = address.trim().toLowerCase();
		if (pair.base_token_address.toLowerCase() === key && pair.base_symbol.trim()) {
			return pair.base_symbol.trim();
		}
		if (pair.quote_token_address.toLowerCase() === key && pair.quote_symbol.trim()) {
			return pair.quote_symbol.trim();
		}
		return pair.base_symbol.trim() || pair.quote_symbol.trim() || 'Token';
	}

	function describedBy(key: RatioThresholdKey): string {
		const ids = ['ratio-limit-hint'];
		if (isRatioDownThreshold(key)) ids.push(`ratio-limit-${key}-hint`);
		if (thresholdErrors[key]) ids.push(`ratio-limit-${key}-error`);
		return ids.join(' ');
	}

	function setThreshold(key: RatioThresholdKey, value: string) {
		thresholdValues[key] = value;
		const raw = value.trim();
		const negative = raw.startsWith('-') || (/^-?\d+(\.\d+)?$/.test(raw) && Number(raw) < 0);
		if (negative) {
			thresholdErrors = { ...thresholdErrors, [key]: THRESHOLD_NEGATIVE_MESSAGE };
			return;
		}
		if (!thresholdErrors[key]) return;
		if (raw === '' || (/^\d+(\.\d+)?$/.test(raw) && Number(raw) >= 0)) {
			const next = { ...thresholdErrors };
			delete next[key];
			thresholdErrors = next;
		}
	}

	function rejectMinus(event: KeyboardEvent, key: RatioThresholdKey) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		if (event.key !== '-' && event.code !== 'Minus' && event.code !== 'NumpadSubtract') return;
		event.preventDefault();
		thresholdErrors = { ...thresholdErrors, [key]: THRESHOLD_NEGATIVE_MESSAGE };
	}

	function limitsFor(watch: SavedRatioWatch): { label: string; value: string }[] {
		return RATIO_THRESHOLD_FIELDS.flatMap((field) => {
			const value = watch[field.key];
			if (value === null || value === 0) return [];
			return [{ label: field.label, value: thresholdInputValue(value) }];
		});
	}

	function sideTitle(pair: BestPair, side: 'base' | 'quote'): string {
		const name = side === 'base' ? pair.base_name : pair.quote_name;
		const symbol = side === 'base' ? pair.base_symbol : pair.quote_symbol;
		return tokenTitle(name, symbol) || 'Token';
	}

	function pricedInText(pair: BestPair): string {
		if (pair.priced_in === 'quote' && ratioSource === 'pair') {
			return 'This ratio prices token A in token B using the pair contract you entered.';
		}
		if (pair.priced_in === 'quote') {
			return 'This ratio prices token A in token B using their highest-liquidity shared pool.';
		}
		if (pair.priced_in === 'usd') {
			return 'This ratio divides token A’s highest-liquidity USD price by token B’s highest-liquidity USD price.';
		}
		if (pair.priced_in) return `Priced in ${pair.priced_in}.`;
		return 'The API did not say how this ratio is priced.';
	}

	async function loadWatches(auth: string, chain: string) {
		const seq = ++listSeq;
		if (!auth || !chain) {
			watches = [];
			return;
		}
		watchesError = '';
		watchesLoading = true;
		try {
			const next = await listRatioWatches(auth, chain);
			if (seq !== listSeq) return;
			watches = next;
		} catch (error) {
			if (seq !== listSeq) return;
			watches = null;
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			watchesError = publicErrorMessage(error, auth);
		} finally {
			if (seq === listSeq) watchesLoading = false;
		}
	}

	async function findSide(side: 'a' | 'b') {
		findError = '';
		findStatus = '';
		formError = '';
		const address = (side === 'a' ? tokenA : tokenB).trim();
		if (!chainId.trim()) {
			findError = 'Choose a chain before you search.';
			await focusId('ratio-find-error');
			return;
		}
		if (!address) {
			findError = 'Enter a token contract address.';
			await focusId(side === 'a' ? 'ratio-token-a' : 'ratio-token-b');
			return;
		}
		finding = side;
		try {
			const pair = await getBestPair(chainId, { token: address });
			if (side === 'a') pairA = pair;
			else pairB = pair;
			ratioResult = null;
			ratioSource = 'tokens';
			findStatus = `Found the highest-liquidity pair for token ${side === 'a' ? 'A' : 'B'}.`;
			await focusId(side === 'a' ? 'ratio-pair-a-heading' : 'ratio-pair-b-heading');
			if (pairA && pairB) await loadRatio();
		} catch (error) {
			if (side === 'a') pairA = null;
			else pairB = null;
			ratioResult = null;
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			findError = publicErrorMessage(error, token);
			await focusId('ratio-find-error');
		} finally {
			finding = null;
		}
	}

	async function loadRatio() {
		const base = tokenA.trim();
		const quote = tokenB.trim();
		if (!base || !quote || !pairA || !pairB) return;
		if (base.toLowerCase() === quote.toLowerCase()) {
			ratioResult = null;
			findError = 'Enter two different token contract addresses.';
			await focusId('ratio-find-error');
			return;
		}
		finding = 'ratio';
		findError = '';
		try {
			ratioResult = await getBestPair(chainId, { base, quote });
			ratioSource = 'tokens';
			findStatus = 'Loaded the current ratio.';
			await focusId('ratio-current-heading');
		} catch (error) {
			ratioResult = null;
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			findError = publicErrorMessage(error, token);
			await focusId('ratio-find-error');
		} finally {
			finding = null;
		}
	}

	async function findPair() {
		findError = '';
		findStatus = '';
		formError = '';
		const address = pairAddress.trim();
		if (!chainId.trim()) {
			findError = 'Choose a chain before you search.';
			await focusId('ratio-find-error');
			return;
		}
		if (!address) {
			findError = 'Enter a pair contract address.';
			await focusId('ratio-pair-address');
			return;
		}
		finding = 'pair';
		try {
			const pair = await getPairByAddress(chainId, address);
			tokenA = pair.base_token_address;
			tokenB = pair.quote_token_address;
			pairA = null;
			pairB = null;
			ratioResult = pair;
			ratioSource = 'pair';
			findStatus = `Loaded ${sideTitle(pair, 'base')} and ${sideTitle(pair, 'quote')} from that pair.`;
			await focusId('ratio-current-heading');
		} catch (error) {
			ratioResult = null;
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			findError = publicErrorMessage(error, token);
			await focusId('ratio-find-error');
		} finally {
			finding = null;
		}
	}

	function editWatch(watch: SavedRatioWatch) {
		editing = watch;
		tokenA = watch.base_token_address;
		tokenB = watch.quote_token_address;
		pairAddress = watch.pair_address ?? '';
		ratioSource = 'tokens';
		pairA = null;
		pairB = null;
		ratioResult = null;
		const next = emptyRatioThresholds();
		for (const field of RATIO_THRESHOLD_FIELDS) {
			next[field.key] = thresholdInputValue(watch[field.key]);
		}
		thresholdValues = next;
		thresholdErrors = {};
		formError = '';
		formStatus = '';
		pendingRemove = null;
		removeError = '';
		void focusId('ratio-form-heading');
	}

	function closeEdit() {
		const id = editing?.id;
		editing = null;
		thresholdValues = emptyRatioThresholds();
		thresholdErrors = {};
		formError = '';
		formStatus = '';
		if (id) void focusId(`ratio-watch-${id}`);
	}

	async function saveWatch(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		formStatus = '';
		if (!token) {
			onUnauthorized();
			return;
		}
		if (!chainId.trim()) {
			formError = 'Choose a chain before you save a ratio watch.';
			onChainRequired();
			return;
		}
		const parsed = parseRatioThresholds(thresholdValues);
		if (!parsed.ok) {
			const next: Partial<Record<RatioThresholdKey, string>> = {};
			for (const error of parsed.errors) next[error.key] = error.message;
			thresholdErrors = next;
			await focusId(`ratio-limit-${parsed.errors[0].key}`);
			return;
		}
		thresholdErrors = {};
		saving = true;
		try {
			if (editing) {
				const saved = await updateRatioWatch(token, editing.id, parsed.body);
				const current = watches ? [...watches] : [];
				watches = ratioWatchesBySymbol([saved, ...current.filter((item) => item.id !== saved.id)]);
				formStatus = `Updated ${saved.name} on ${chainLabel(saved.chain_id)}.`;
				editing = null;
				thresholdValues = emptyRatioThresholds();
				listOpen = true;
				await focusId('ratio-form-status');
				void loadWatches(token, chainId);
				return;
			}
			if (!ratioResult) {
				formError = 'Find both tokens and load the ratio before you save.';
				await focusId('ratio-form-error');
				return;
			}
			const base = tokenA.trim();
			const quote = tokenB.trim();
			const baseSymbol = ratioResult.base_symbol.trim() || symbolFor(base, pairA);
			const quoteSymbol = ratioResult.quote_symbol.trim() || symbolFor(quote, pairB);
			const saved = await createRatioWatch(token, {
				chain_id: chainId,
				base_token_address: base,
				quote_token_address: quote,
				name: `${sideTitle(ratioResult, 'base')} / ${sideTitle(ratioResult, 'quote')}`,
				symbol: `${baseSymbol}/${quoteSymbol}`,
				...parsed.body
			});
			const current = watches ? [...watches] : [];
			watches = ratioWatchesBySymbol([saved, ...current.filter((item) => item.id !== saved.id)]);
			const notice = `Added ${saved.name} on ${chainLabel(saved.chain_id)}.`;
			clearResolved();
			formStatus = notice;
			listOpen = true;
			await focusId('ratio-form-status');
			void loadWatches(token, chainId);
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (message === PICK_CHAIN_MESSAGE) {
				formError = message;
				onChainRequired();
				return;
			}
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			formError = message;
			await focusId('ratio-form-error');
		} finally {
			saving = false;
		}
	}

	function askRemove(watch: SavedRatioWatch) {
		pendingRemove = {
			id: watch.id,
			name: watchDisplay(watch.name, watch.symbol),
			triggerId: `ratio-remove-${watch.id}`
		};
		removeError = '';
		void focusId('ratio-remove-confirm');
	}

	function cancelRemove() {
		const triggerId = pendingRemove?.triggerId ?? '';
		pendingRemove = null;
		removeError = '';
		if (triggerId) void focusId(triggerId);
	}

	async function confirmRemove() {
		if (!pendingRemove) return;
		if (!token) {
			onUnauthorized();
			return;
		}
		removing = true;
		removeError = '';
		const target = pendingRemove;
		try {
			await deleteRatioWatch(token, target.id);
			watches = ratioWatchesBySymbol((watches ?? []).filter((item) => item.id !== target.id));
			if (editing?.id === target.id) closeEdit();
			pendingRemove = null;
			formStatus = `Removed ${target.name} from the ratio watch list.`;
			await focusId('ratio-form-status');
			void loadWatches(token, chainId);
		} catch (error) {
			if (isLoginError(error)) {
				onUnauthorized();
				return;
			}
			removeError = publicErrorMessage(error, token);
			await focusId('ratio-remove-error');
		} finally {
			removing = false;
		}
	}

	function onTokenInput(side: 'a' | 'b', value: string) {
		if (side === 'a') {
			tokenA = value;
			pairA = null;
		} else {
			tokenB = value;
			pairB = null;
		}
		ratioResult = null;
		ratioSource = 'tokens';
		findStatus = '';
	}
</script>

<section id="ratio-watch" class="ratio" aria-labelledby="ratio-watch-heading">
	<h2 id="ratio-watch-heading" tabindex="-1">Ratio Watch</h2>
	<p>
		Enter two token contracts on {chainLabel(chainId)}, or one pair contract. A token search asks
		the Blind Bit Boys API for that token’s highest-liquidity pair. A pair address loads both tokens
		in that contract. Either way, the API returns the current ratio.
	</p>

	{#if findError}
		<p id="ratio-find-error" role="alert" tabindex="-1">{findError}</p>
	{/if}
	{#if findStatus}
		<p id="ratio-find-status" role="status" tabindex="-1">{findStatus}</p>
	{/if}

	{#if !editing}
	<form novalidate onsubmit={(event) => event.preventDefault()}>
		<div class="field">
			<label for="ratio-token-a">Token A contract address</label>
			<input
				id="ratio-token-a"
				type="text"
				autocomplete="off"
				spellcheck="false"
				value={tokenA}
				oninput={(event) => {
					const input = event.currentTarget;
					if (input instanceof HTMLInputElement) onTokenInput('a', input.value);
				}}
			/>
		</div>
		<button type="button" disabled={finding !== null} onclick={() => findSide('a')}>
			Find highest-liquidity pair<span class="sr-only"> for token A</span>
		</button>

		{#if pairA}
			<h3 id="ratio-pair-a-heading" tabindex="-1">Highest-liquidity pair for token A</h3>
			<p>
				{sideTitle(pairA, 'base')} / {sideTitle(pairA, 'quote')}
			</p>
			<p>DEX: {pairA.dex || 'not available'}</p>
			<p>Liquidity USD: {usdText(pairA.liquidity_usd)}</p>
			<p>Price USD: {usdText(pairA.price_usd)}</p>
			<p class="wrap">Pair address: {pairA.pair_address || 'not available'}</p>
		{/if}

		<div class="field">
			<label for="ratio-token-b">Token B contract address</label>
			<input
				id="ratio-token-b"
				type="text"
				autocomplete="off"
				spellcheck="false"
				value={tokenB}
				oninput={(event) => {
					const input = event.currentTarget;
					if (input instanceof HTMLInputElement) onTokenInput('b', input.value);
				}}
			/>
		</div>
		<button type="button" disabled={finding !== null} onclick={() => findSide('b')}>
			Find highest-liquidity pair<span class="sr-only"> for token B</span>
		</button>

		{#if pairB}
			<h3 id="ratio-pair-b-heading" tabindex="-1">Highest-liquidity pair for token B</h3>
			<p>
				{sideTitle(pairB, 'base')} / {sideTitle(pairB, 'quote')}
			</p>
			<p>DEX: {pairB.dex || 'not available'}</p>
			<p>Liquidity USD: {usdText(pairB.liquidity_usd)}</p>
			<p>Price USD: {usdText(pairB.price_usd)}</p>
			<p class="wrap">Pair address: {pairB.pair_address || 'not available'}</p>
		{/if}

		<h3>Or use a pair contract</h3>
		<div class="field">
			<label for="ratio-pair-address">Pair contract address</label>
			<input
				id="ratio-pair-address"
				type="text"
				autocomplete="off"
				spellcheck="false"
				value={pairAddress}
				oninput={(event) => {
					const input = event.currentTarget;
					if (input instanceof HTMLInputElement) pairAddress = input.value;
				}}
			/>
		</div>
		<button type="button" disabled={finding !== null} onclick={() => findPair()}>
			Use this pair<span class="sr-only"> contract to load both tokens and the current ratio</span>
		</button>
	</form>
	{/if}

	{#if ratioResult}
		<h3 id="ratio-current-heading" tabindex="-1">
			Current ratio for {sideTitle(ratioResult, 'base')} / {sideTitle(ratioResult, 'quote')}
		</h3>
		<p>
			{sideTitle(ratioResult, 'base')} / {sideTitle(ratioResult, 'quote')}
		</p>
		<p>Ratio: {ratioResult.ratio || 'not available'}</p>
		<p>{pricedInText(ratioResult)}</p>
		{#if ratioResult.pair_address}
			<p class="wrap">Pair address: {ratioResult.pair_address}</p>
		{/if}
		{#if ratioResult.base_pair_address}
			<p class="wrap">Token A pool: {ratioResult.base_pair_address}</p>
		{/if}
		{#if ratioResult.quote_pair_address}
			<p class="wrap">Token B pool: {ratioResult.quote_pair_address}</p>
		{/if}
	{/if}

	<form novalidate onsubmit={saveWatch}>
		<h3 id="ratio-form-heading" tabindex="-1">
			{editing ? `Edit ${watchDisplay(editing.name, editing.symbol)}` : 'Ratio alert limits'}
		</h3>
		{#if editing}
			<p>Chain: {chainLabel(editing.chain_id)}</p>
			<p class="wrap">Token A: {editing.base_token_address}</p>
			<p class="wrap">Token B: {editing.quote_token_address}</p>
		{/if}
		<fieldset>
			<legend>Alert limits</legend>
			<p id="ratio-limit-hint">Leave a limit blank to turn that alert off.</p>
			{#each RATIO_THRESHOLD_FIELDS as field (field.key)}
				<div class="field">
					<label for="ratio-limit-{field.key}">{field.label}</label>
					<input
						id="ratio-limit-{field.key}"
						type="number"
						inputmode="decimal"
						min="0"
						step="any"
						autocomplete="off"
						aria-describedby={describedBy(field.key)}
						aria-invalid={thresholdErrors[field.key] ? 'true' : undefined}
						value={thresholdValues[field.key]}
						onkeydown={(event) => rejectMinus(event, field.key)}
						oninput={(event) => {
							const input = event.currentTarget;
							if (!(input instanceof HTMLInputElement)) return;
							setThreshold(field.key, input.value);
						}}
					/>
					{#if isRatioDownThreshold(field.key)}
						<p id="ratio-limit-{field.key}-hint">{DOWN_THRESHOLD_HINT}</p>
					{/if}
					{#if thresholdErrors[field.key]}
						<p id="ratio-limit-{field.key}-error" role="alert">{thresholdErrors[field.key]}</p>
					{/if}
				</div>
			{/each}
		</fieldset>
		{#if formError}
			<p id="ratio-form-error" role="alert" tabindex="-1">{formError}</p>
		{/if}
		{#if formStatus}
			<p id="ratio-form-status" role="status" tabindex="-1">{formStatus}</p>
		{/if}
		<div class="actions">
			<button type="submit" disabled={saving || removing || finding !== null}>
				{editing ? 'Update ratio watch' : 'Save ratio watch'}
			</button>
			{#if editing}
				<button type="button" onclick={closeEdit}>Close ratio watch form</button>
			{/if}
		</div>
	</form>

	<h3>
		<button
			type="button"
			id="ratio-list-button"
			class="disclosure"
			aria-expanded={listOpen}
			aria-controls="ratio-list-panel"
			onclick={() => (listOpen = !listOpen)}
		>
			Ratio watch list
		</button>
	</h3>
	<div
		id="ratio-list-panel"
		role="region"
		aria-labelledby="ratio-list-button"
		hidden={!listOpen}
	>
		<p>Alphabetical by symbol.</p>
		{#if watchesError}
			<p id="ratio-watches-error" role="alert" tabindex="-1">{watchesError}</p>
		{/if}
		{#if watchesLoading && !watches}
			<p role="status">Loading your ratio watches.</p>
		{:else if watches && watches.length === 0}
			<p>You have no saved ratio watches on this chain yet.</p>
		{:else if watches}
			<ul class="plain">
				{#each watches as watch (watch.id)}
					<li>
						<h4 id="ratio-watch-{watch.id}" tabindex="-1">
							{watchDisplay(watch.name, watch.symbol)}
						</h4>
						<p>Symbol: {watch.symbol}</p>
						<p>Chain: {chainLabel(watch.chain_id)}</p>
						<p class="wrap">Token A: {watch.base_token_address}</p>
						<p class="wrap">Token B: {watch.quote_token_address}</p>
						{#if watch.ratio}<p>Last ratio: {watch.ratio}</p>{/if}
						{#if !watch.active}<p>This watch is off.</p>{/if}
						{#if limitsFor(watch).length === 0}
							<p>No limits are set.</p>
						{:else}
							<ul>
								{#each limitsFor(watch) as limit (limit.label)}
									<li>{limit.label}: {limit.value}</li>
								{/each}
							</ul>
						{/if}
						<div class="actions">
							<button type="button" onclick={() => editWatch(watch)}>
								Edit<span class="sr-only"> {watchDisplay(watch.name, watch.symbol)}</span>
							</button>
							{#if pendingRemove?.id === watch.id}
								<div role="group" aria-labelledby="ratio-remove-confirm">
									<p id="ratio-remove-confirm" tabindex="-1">
										Remove the ratio watch for {watchDisplay(watch.name, watch.symbol)}?
									</p>
									{#if removeError}
										<p id="ratio-remove-error" role="alert" tabindex="-1">{removeError}</p>
									{/if}
									<button type="button" disabled={removing} onclick={confirmRemove}>Remove</button>
									<button type="button" disabled={removing} onclick={cancelRemove}>Cancel</button>
								</div>
							{:else}
								<button
									type="button"
									id="ratio-remove-{watch.id}"
									onclick={() => askRemove(watch)}
								>
									Remove<span class="sr-only"> {watchDisplay(watch.name, watch.symbol)}</span>
								</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>

<style>
	.ratio {
		margin-top: 1.5rem;
	}

	h2,
	h3,
	h4 {
		scroll-margin-top: calc(var(--site-header-offset) + 0.75rem);
	}

	h4 {
		font-size: 1rem;
		margin: 0.75rem 0 0.25rem;
	}

	.field {
		margin-top: 1rem;
	}

	label,
	legend {
		font-weight: 700;
	}

	fieldset {
		margin-top: 1.25rem;
		padding: 0.75rem 1rem 1rem;
		border: 1px solid #d4af37;
		border-radius: 0.375rem;
	}

	input[type='text'],
	input[type='number'] {
		display: block;
		width: 100%;
		max-width: 40rem;
		min-height: 2.75rem;
		margin-top: 0.35rem;
		padding: 0.55rem 0.75rem;
		border-radius: 0.375rem;
	}

	button {
		min-height: 2.75rem;
		margin: 1rem 0.75rem 0 0;
		padding: 0.55rem 1.1rem;
		border-radius: 0.375rem;
		font-weight: 700;
		cursor: pointer;
	}

	.disclosure {
		display: block;
		width: min(100%, 40rem);
		margin: 0.75rem 0 0;
		text-align: left;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin-top: 1rem;
	}

	.actions button {
		margin: 0;
	}

	button:disabled {
		cursor: not-allowed;
	}

	button:focus-visible,
	input:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.wrap {
		overflow-wrap: anywhere;
	}

	.plain {
		padding-left: 1.25rem;
	}

	[hidden] {
		display: none;
	}
</style>
