<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
	import {
		PriceWatchApiError,
		publicErrorMessage,
		tokenTitle,
		type RankingRow
	} from '$lib/priceWatchApi';

	type WindowChoice = { value: string; label: string };
	type ScheduleChoice = { value: string; seconds: number; label: string };

	type Props = {
		boardId: string;
		title: string;
		windows: readonly WindowChoice[];
		initialWindow: string;
		chainId: string;
		loadRows: (window: string, chainId: string) => Promise<RankingRow[]>;
		scheduleChoices: readonly ScheduleChoice[];
		scheduleSeconds: number;
		scheduleFallback: string;
		lastSent: string | null;
		scheduleHint: string;
		scheduleName: string;
		variant: 'movers' | 'volume';
		onSaveSchedule: (seconds: number) => Promise<void>;
		onWatch: (row: RankingRow, returnId: string) => void;
		onUnauthorized: () => void;
	};

	let {
		boardId,
		title,
		windows,
		initialWindow,
		chainId,
		loadRows,
		scheduleChoices,
		scheduleSeconds,
		scheduleFallback,
		lastSent,
		scheduleHint,
		scheduleName,
		variant,
		onSaveSchedule,
		onWatch,
		onUnauthorized
	}: Props = $props();

	const refreshMs = 15_000;

	let open = $state(false);
	let view = $state<string | undefined>(undefined);
	let rows = $state<RankingRow[] | null>(null);
	let loadError = $state('');
	let updated = $state('');
	let copyStatus = $state('');
	let every = $state('');
	let saveError = $state('');
	let saveStatus = $state('');
	let saving = $state(false);

	$effect(() => {
		const seconds = scheduleSeconds;
		const fallback = scheduleFallback;
		const choices = scheduleChoices;
		every = choices.some((item) => item.seconds === seconds) ? String(seconds) : fallback;
	});

	$effect(() => {
		const isOpen = open;
		const currentView = view ?? initialWindow;
		const currentChain = chainId;
		if (!isOpen) return;
		let ticket = 0;
		let active = true;
		let timer: ReturnType<typeof setInterval> | null = null;

		async function load(reset: boolean) {
			const mine = ++ticket;
			if (reset) {
				rows = null;
				loadError = '';
			}
			try {
				const next = await untrack(() => loadRows(currentView, currentChain));
				if (!active || mine !== ticket) return;
				rows = next;
				loadError = '';
				updated = clockText(new Date());
			} catch (error) {
				if (!active || mine !== ticket) return;
				rows = [];
				loadError = publicErrorMessage(error, null);
			}
		}

		void load(true);
		timer = setInterval(() => {
			void load(false);
		}, refreshMs);
		return () => {
			active = false;
			if (timer) clearInterval(timer);
		};
	});

	function clockText(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
	}

	function sentText(value: string): string {
		const time = Date.parse(value);
		if (!Number.isFinite(time)) return value;
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(time);
	}

	function nextDueText(): string {
		const everySeconds = scheduleSeconds;
		if (everySeconds <= 0) return `No ${scheduleName} message is scheduled.`;
		if (!lastSent) return `The next ${scheduleName} message is due on the bot's next check.`;
		const last = Date.parse(lastSent);
		if (!Number.isFinite(last)) return `The next ${scheduleName} message is due on the bot's next check.`;
		const due = last + everySeconds * 1000;
		if (due <= Date.now()) return `The next ${scheduleName} message is due now.`;
		return `The next ${scheduleName} message is due ${sentText(new Date(due).toISOString())}.`;
	}

	function usdText(value: string): string {
		if (!value) return 'not available';
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return 'not available';
		return formatCryptoPrice(numeric);
	}

	function pairTitle(row: RankingRow): string {
		const symbol = row.symbol.trim();
		const quote = row.quote_symbol.trim();
		const left = tokenTitle(row.name, symbol);
		const quoteAlreadyShown =
			!quote || symbol.includes('/') || symbol.toLowerCase().includes(quote.toLowerCase());
		if (quoteAlreadyShown) return left || quote || 'this token';
		if (left) return `${left} / ${quote}`;
		return quote;
	}

	function percentText(value: number | null): string {
		if (value === null || !Number.isFinite(value)) return 'Percent change: not available.';
		const amount = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(value);
		return `Percent change: ${amount}%.`;
	}

	function fieldText(label: string, value: string): string {
		const text = value.trim();
		return text ? `${label}: ${text}` : `${label}: not available.`;
	}

	function rowId(row: RankingRow, index: number): string {
		const key = (row.pair_address || row.id).replace(/[^a-zA-Z0-9_-]/g, '');
		return `${boardId}-row-${key || 'row'}-${index}`;
	}

	async function focusId(id: string) {
		await tick();
		const node = document.getElementById(id);
		if (!(node instanceof HTMLElement)) return;
		node.focus();
		node.scrollIntoView({ block: 'nearest' });
	}

	function toggle() {
		open = !open;
		if (!open) {
			rows = null;
			loadError = '';
			updated = '';
		}
	}

	function chooseView(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		if (!windows.some((item) => item.value === select.value)) return;
		if (select.value === (view ?? initialWindow) && rows !== null && !loadError) return;
		view = select.value;
	}

	async function copyAddress(kind: string, row: RankingRow) {
		const value = (kind === 'token contract' ? row.token_address : row.pair_address) || '';
		const label = `${kind} for ${pairTitle(row)}`;
		if (!value.trim()) {
			copyStatus = `The ${label} is not available.`;
			await focusId(`${boardId}-copy-status`);
			return;
		}
		try {
			await navigator.clipboard.writeText(value.trim());
			copyStatus = `Copied the ${label}.`;
		} catch {
			copyStatus = `Could not copy the ${label}. It is still shown on the page.`;
		}
		await focusId(`${boardId}-copy-status`);
	}

	async function saveSchedule(event: SubmitEvent) {
		event.preventDefault();
		saveError = '';
		saveStatus = '';
		const choice = scheduleChoices.find((item) => item.value === every);
		if (!choice) {
			saveError = 'Choose a schedule from the list.';
			await focusId(`${boardId}-save-error`);
			return;
		}
		saving = true;
		try {
			await onSaveSchedule(choice.seconds);
			saveStatus = 'Saved.';
			await focusId(`${boardId}-save-status`);
		} catch (error) {
			if (error instanceof PriceWatchApiError && error.status === 401) {
				onUnauthorized();
				return;
			}
			saveError = publicErrorMessage(error, null);
			await focusId(`${boardId}-save-error`);
		} finally {
			saving = false;
		}
	}
</script>

<div class="board">
	<h3>
		<button
			type="button"
			id="{boardId}-button"
			class="disclosure"
			aria-expanded={open}
			aria-controls="{boardId}-panel"
			onclick={toggle}
		>
			{title}
		</button>
	</h3>
	<div
		id="{boardId}-panel"
		class="panel"
		role="region"
		aria-labelledby="{boardId}-button"
		hidden={!open}
	>
		<div class="field">
			<label for="{boardId}-view">View</label>
			<select id="{boardId}-view" value={view ?? initialWindow} onchange={chooseView}>
				{#each windows as choice (choice.value)}
					<option value={choice.value}>{choice.label}</option>
				{/each}
			</select>
		</div>
		{#if loadError}
			<p id="{boardId}-error" role="alert" tabindex="-1">{loadError}</p>
		{:else if rows === null}
			<p role="status">Loading this view.</p>
		{:else if rows.length === 0}
			<p>This view has no tokens yet.</p>
		{:else}
			{#if copyStatus}
				<p id="{boardId}-copy-status" role="status" tabindex="-1" aria-live="polite">{copyStatus}</p>
			{/if}
			<ol class="horse-list">
				{#each rows as row, index (`${boardId}:${view}:${row.pair_address || row.id}:${index}`)}
					<li class="wrap">
						<h4 id={rowId(row, index)} tabindex="-1">
							Rank {row.rank ?? index + 1}. {pairTitle(row)}
						</h4>
						<p>{fieldText('Symbol', row.symbol)}</p>
						<p>{fieldText('Name', row.name)}</p>
						{#if variant === 'volume'}
							<p>Volume: {usdText(row.volume_usd)}</p>
						{:else}
							<p>{percentText(row.price_change_pct)}</p>
						{/if}
						<p>Price: {usdText(row.price_usd)}</p>
						<p>Liquidity: {usdText(row.liquidity_usd)}</p>
						{#if row.token_address}
							<p class="wrap">
								Token contract: {row.token_address}
								<button type="button" onclick={() => copyAddress('token contract', row)}>
									Copy token contract<span class="sr-only"> for {pairTitle(row)}</span>
								</button>
							</p>
						{:else}
							<p>Token contract: not available yet.</p>
						{/if}
						{#if row.pair_address}
							<p class="wrap">
								Pair address: {row.pair_address}
								<button type="button" onclick={() => copyAddress('pair address', row)}>
									Copy pair address<span class="sr-only"> for {pairTitle(row)}</span>
								</button>
							</p>
							<button type="button" onclick={() => onWatch(row, rowId(row, index))}>
								Watch this pair<span class="sr-only"> {pairTitle(row)}</span>
							</button>
						{/if}
					</li>
				{/each}
			</ol>
		{/if}
		{#if updated && !loadError}
			<p role="status" aria-atomic="true">Updated {updated}.</p>
		{/if}
		{#if lastSent}
			<p>Last sent {sentText(lastSent)}.</p>
		{/if}
		<p>{nextDueText()}</p>
		<form novalidate onsubmit={saveSchedule}>
			<div class="field">
				<label for="{boardId}-every">How often {scheduleName} may send Telegram notifications</label>
				<select id="{boardId}-every" bind:value={every} aria-describedby="{boardId}-hint">
					{#each scheduleChoices as choice (choice.value)}
						<option value={choice.value}>{choice.label}</option>
					{/each}
				</select>
				<p id="{boardId}-hint">{scheduleHint}</p>
			</div>
			{#if saveError}
				<p id="{boardId}-save-error" role="alert" tabindex="-1">{saveError}</p>
			{/if}
			{#if saveStatus}
				<p id="{boardId}-save-status" role="status" tabindex="-1">{saveStatus}</p>
			{/if}
			<button type="submit" disabled={saving}>Save</button>
		</form>
	</div>
</div>

<style>
	.board {
		margin-top: 0.75rem;
	}

	h3 {
		font-size: 1.15rem;
		margin: 0;
	}

	.disclosure {
		display: block;
		width: min(100%, 40rem);
		min-height: 2.75rem;
		margin: 0;
		padding: 0.55rem 1.1rem;
		border: 2px dashed #14120b;
		border-radius: 0.375rem;
		font-weight: 400;
		text-align: left;
		cursor: pointer;
	}

	.disclosure[aria-expanded='true'] {
		border-style: solid;
		border-width: 4px;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	.panel {
		margin-top: 0.75rem;
	}

	.panel[hidden] {
		display: none;
	}

	.field {
		margin-top: 1rem;
	}

	label {
		font-weight: 700;
	}

	select {
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

	button:disabled {
		cursor: not-allowed;
	}

	button:focus-visible,
	select:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.wrap {
		overflow-wrap: anywhere;
	}

	ol.horse-list {
		list-style: decimal;
		padding-left: 2rem;
	}

	h4 {
		font-size: 1rem;
		margin: 0.75rem 0 0.25rem;
	}
</style>
