<script lang="ts">
	type Tab = { id: string; label: string };

	interface Props {
		tabs: Tab[];
		label: string;
		active?: string;
		onEnter?: (id: string) => void;
	}

	let { tabs, label, active = $bindable('overview'), onEnter }: Props = $props();

	function onKey(event: KeyboardEvent) {
		if ((event.key === 'Enter' || event.key === ' ') && onEnter) {
			const target = event.target;
			const tab =
				target instanceof Element ? target.closest('[role="tab"]') : null;
			const id = tab?.id.startsWith('tab-') ? tab.id.slice(4) : '';
			if (!id || !tabs.some((item) => item.id === id)) return;
			event.preventDefault();
			active = id;
			onEnter(id);
			return;
		}
		const nextKey =
			event.key === 'ArrowRight' || event.key === 'ArrowDown'
				? 1
				: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
					? -1
					: event.key === 'Home'
						? 'home'
						: event.key === 'End'
							? 'end'
							: 0;
		if (nextKey === 0) return;
		event.preventDefault();
		const index = tabs.findIndex((tab) => tab.id === active);
		const next =
			nextKey === 'home'
				? 0
				: nextKey === 'end'
					? tabs.length - 1
					: (index + nextKey + tabs.length) % tabs.length;
		active = tabs[next]?.id ?? active;
		document.getElementById(`tab-${active}`)?.focus();
	}
</script>

<div class="access-tabs" role="tablist" aria-label={label} tabindex="-1" onkeydown={onKey}>
	{#each tabs as tab (tab.id)}
		<button
			class="access-tab"
			type="button"
			role="tab"
			id={`tab-${tab.id}`}
			aria-selected={active === tab.id}
			aria-controls={`panel-${tab.id}`}
			tabindex={active === tab.id ? 0 : -1}
			onclick={() => (active = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<style>
	.access-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: stretch;
		position: static;
		margin: 0 0 1.25rem;
	}

	.access-tab {
		position: static;
		flex: 0 0 auto;
		width: auto;
		min-height: 2.75rem;
		margin: 0;
		padding: 0.55rem 1.1rem;
		border: 2px solid #d4af37;
		border-radius: 0.375rem;
		background: #1f2937;
		color: #f3f4f6;
		font-size: 1rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.access-tab:hover {
		background: #374151;
		color: #f3f4f6;
	}

	.access-tab:focus-visible {
		outline: 2px solid #e6c35c;
		outline-offset: 2px;
	}

	.access-tab[aria-selected='true'] {
		background: #d4af37;
		color: #14120b;
		border-color: #d4af37;
	}

	.access-tab[aria-selected='true']:hover {
		background: #e6c35c;
		color: #14120b;
	}
</style>
