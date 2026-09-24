<script lang="ts">
	type Tab = { id: string; label: string };

	interface Props {
		tabs: Tab[];
		label: string;
		active?: string;
	}

	let { tabs, label, active = $bindable('overview') }: Props = $props();

	function onKey(event: KeyboardEvent) {
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

<div role="tablist" aria-label={label} tabindex="-1" onkeydown={onKey}>
	{#each tabs as tab (tab.id)}
		<button
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
