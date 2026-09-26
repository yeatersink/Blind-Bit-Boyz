<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { navItems } from '$lib/utils/navManager';

	let open = $state(false);
	let mobile = $state(false);
	let buttonEl = $state<HTMLButtonElement | null>(null);
	let panelEl = $state<HTMLUListElement | null>(null);

	let path = $derived($page.url.pathname);

	onMount(() => {
		const desktopQuery = window.matchMedia('(min-width: 64rem)');
		const sync = () => {
			mobile = !desktopQuery.matches;
			if (!mobile) open = false;
		};
		sync();
		desktopQuery.addEventListener('change', sync);
		return () => desktopQuery.removeEventListener('change', sync);
	});

	afterNavigate(() => {
		open = false;
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) return;
		event.preventDefault();
		open = false;
		buttonEl?.focus();
	}

	function onPointerDown(event: PointerEvent) {
		if (!open) return;
		const target = event.target;
		if (!(target instanceof Node)) return;
		if (buttonEl?.contains(target) || panelEl?.contains(target)) return;
		open = false;
	}

	async function toggle() {
		open = !open;
		if (!open) return;
		await tick();
		const first = panelEl?.querySelector('a');
		if (first instanceof HTMLAnchorElement) first.focus({ preventScroll: true });
	}
</script>

<svelte:window onkeydown={onKeydown} onpointerdown={onPointerDown} />

<nav class="site-nav" aria-label="Global">
	<button
		bind:this={buttonEl}
		type="button"
		class="menu-button"
		aria-expanded={open}
		aria-controls="global-nav-panel"
		onclick={toggle}
	>
		Menu
	</button>
	<ul id="global-nav-panel" bind:this={panelEl} class:is-open={open} inert={mobile && !open}>
		{#each navItems as { name, url } (url)}
			<li>
				<a
					href={url}
					aria-current={url === path ? 'page' : undefined}
					onclick={() => (open = false)}
				>
					{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.site-nav {
		position: static;
	}

	.menu-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: 0.4rem 0.95rem;
		border: 2px solid #d4af37;
		border-radius: 0.375rem;
		background: #000;
		color: #f3f4f6;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.2;
		cursor: pointer;
	}

	.menu-button:hover {
		background: #1f2937;
		color: #f0d78c;
	}

	.menu-button[aria-expanded='true'] {
		background: #d4af37;
		color: #14120b;
	}

	.menu-button:focus-visible {
		outline: 2px solid #e6c35c;
		outline-offset: 3px;
	}

	ul {
		display: none;
		margin: 0;
		padding: 0.35rem 0;
		list-style: none;
	}

	ul.is-open {
		position: absolute;
		z-index: 60;
		top: 100%;
		right: 0;
		left: 0;
		display: block;
		max-height: min(70dvh, 24rem);
		overflow: auto;
		border-bottom: 1px solid #d4af37;
		background: #000;
	}

	ul a,
	ul a:visited {
		display: block;
		padding: 0.8rem 1.25rem;
		color: #e6c35c;
		font-weight: 700;
		text-decoration: none;
	}

	ul a:hover,
	ul a[aria-current='page'] {
		background: rgb(212 175 55 / 0.12);
		color: #f0d78c;
	}

	ul a:focus-visible {
		outline: 2px solid #e6c35c;
		outline-offset: -2px;
	}

	@media (min-width: 64rem) {
		.menu-button {
			display: none;
		}

		ul,
		ul.is-open {
			position: static;
			display: flex;
			align-items: center;
			gap: 1.25rem;
			max-height: none;
			overflow: visible;
			padding: 0;
			border: 0;
			background: transparent;
		}

		ul a,
		ul a:visited {
			padding: 0.35rem 0;
			background: transparent;
			color: #f3f4f6;
			font-weight: 600;
			white-space: nowrap;
		}

		ul a:hover,
		ul a[aria-current='page'] {
			background: transparent;
			color: #e6c35c;
		}

		ul a:focus-visible {
			outline-offset: 3px;
		}
	}

	@media (min-width: 80rem) {
		ul,
		ul.is-open {
			gap: 1.75rem;
		}
	}
</style>
