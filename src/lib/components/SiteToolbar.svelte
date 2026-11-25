<script lang="ts">
	import {
		LOCALES,
		TEXT_SIZES,
		getInverted,
		getLocale,
		getTextSize,
		localeNative,
		setInverted,
		setLocale,
		setTextSize,
		t,
		type TextSize
	} from '$lib/i18n/preferences.svelte';

	let status = $state('');
	let open = $state(false);
	let trigger = $state<HTMLButtonElement | null>(null);
	let panel = $state<HTMLElement | null>(null);

	const locale = $derived(getLocale());
	const textSize = $derived(getTextSize());
	const inverted = $derived(getInverted());

	async function chooseLanguage(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		await setLocale(select.value);
		status = t('lang.now', { name: localeNative(select.value) });
	}

	function chooseSize(next: TextSize) {
		setTextSize(next);
		status = t(TEXT_SIZES.find((item) => item.id === next)?.key ?? 'a11y.normal');
	}

	function toggleInvert() {
		const next = !getInverted();
		setInverted(next);
		status = next ? t('a11y.invertOn') : t('a11y.invertOff');
	}

	function togglePanel() {
		open = !open;
	}

	function closePanel(returnFocus: boolean) {
		if (!open) return;
		open = false;
		if (returnFocus) trigger?.focus();
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (!open || event.key !== 'Escape') return;
		event.preventDefault();
		closePanel(true);
	}

	function onWindowClick(event: MouseEvent) {
		if (!open) return;
		const target = event.target;
		if (!(target instanceof Node)) return;
		if (trigger?.contains(target) || panel?.contains(target)) return;
		open = false;
	}
</script>

<svelte:window onkeydown={onWindowKeydown} onclick={onWindowClick} />

<div class="site-toolbar" role="region" aria-label={t('a11y.toolbar')}>
	<div class="lang-field">
		<label for="site-language">{t('lang.label')}</label>
		<select id="site-language" value={locale} onchange={chooseLanguage}>
			{#each LOCALES as item (item.id)}
				<option value={item.id}>{item.native}</option>
			{/each}
		</select>
	</div>
	<div class="a11y">
		<button
			bind:this={trigger}
			type="button"
			id="a11y-button"
			class="a11y-trigger"
			aria-expanded={open}
			aria-controls="a11y-panel"
			onclick={togglePanel}
		>
			{t('a11y.button')}
			<span class="a11y-chevron" aria-hidden="true"></span>
		</button>
		<div
			bind:this={panel}
			id="a11y-panel"
			class="a11y-panel"
			role="region"
			aria-labelledby="a11y-button"
			hidden={!open}
		>
			<div role="radiogroup" class="size-field" aria-labelledby="text-size-label">
				<span id="text-size-label">{t('a11y.text')}</span>
				<div class="size-options">
					{#each TEXT_SIZES as item (item.id)}
						<button
							type="button"
							role="radio"
							aria-checked={textSize === item.id}
							onclick={() => chooseSize(item.id)}
						>
							{t(item.key)}
						</button>
					{/each}
				</div>
			</div>
			<button type="button" class="invert" aria-pressed={inverted} onclick={toggleInvert}>
				{t('a11y.invert')}
			</button>
		</div>
	</div>
	<p class="sr-only" aria-live="polite">{status}</p>
</div>

<style>
	.site-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 0.55rem 0.75rem;
		padding: 0.45rem 0.6rem;
		border: 1px solid rgb(212 175 55 / 0.55);
		border-radius: 0.5rem;
		background: rgb(20 18 11 / 0.92);
	}

	.a11y {
		position: relative;
	}

	label,
	#text-size-label {
		display: block;
		margin-bottom: 0.15rem;
		color: #f0d78c;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	select,
	.a11y-trigger,
	.size-options button,
	.invert {
		min-height: 2.75rem;
		padding: 0.45rem 0.75rem;
		border: 2px solid #d4af37;
		border-radius: 0.375rem;
		background: #000;
		color: #f3f4f6;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	select {
		max-width: 12rem;
		padding: 0.35rem 0.6rem;
	}

	.a11y-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.85rem;
	}

	.a11y-chevron {
		width: 0.5rem;
		height: 0.5rem;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: translateY(-0.12rem) rotate(45deg);
	}

	.a11y-trigger[aria-expanded='true'] .a11y-chevron {
		transform: translateY(0.12rem) rotate(225deg);
	}

	.a11y-trigger[aria-expanded='true'] {
		background: #d4af37;
		color: #14120b;
	}

	.a11y-panel {
		position: absolute;
		z-index: 30;
		inset-inline-end: 0;
		top: calc(100% + 0.4rem);
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		width: max-content;
		max-width: min(22rem, 90vw);
		padding: 0.75rem;
		border: 2px solid #d4af37;
		border-radius: 0.5rem;
		background: rgb(20 18 11 / 0.98);
		box-shadow: 0 0.75rem 1.5rem rgb(0 0 0 / 0.45);
	}

	.a11y-panel[hidden] {
		display: none;
	}

	.size-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.size-options button,
	.invert {
		font-size: 0.85rem;
	}

	.invert {
		align-self: flex-start;
	}

	.size-options button[aria-checked='true'],
	.invert[aria-pressed='true'] {
		background: #d4af37;
		color: #14120b;
	}

	.size-options button:hover,
	.invert:hover,
	.a11y-trigger:hover,
	select:hover {
		color: #f0d78c;
	}

	.size-options button[aria-checked='true']:hover,
	.invert[aria-pressed='true']:hover,
	.a11y-trigger[aria-expanded='true']:hover {
		color: #14120b;
	}

	select:focus-visible,
	.a11y-trigger:focus-visible,
	.size-options button:focus-visible,
	.invert:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}
</style>
