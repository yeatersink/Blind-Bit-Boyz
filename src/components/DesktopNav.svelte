<script lang="ts">
	import { page } from '$app/stores';
	let navItems = [
		{ name: 'Home', url: '/' },
		{ name: 'Search for a Coin', url: '/coin-search' },
		{ name: 'Lost Coin Finder', url: '/lost-coin-finder' },
		{ name: 'Wallet Tracker', url: '/wallet-tracker' }
	];
</script>

<nav>
	<ul class="flex space-x-4">
		{#each navItems as { name, url }}
			<li>
				<a
					href={url}
					aria-current={url === $page.url.pathname ? 'page' : undefined}
					class:active={url === $page.url.pathname}
					class="text-gray-400 hover:text-gold-500 focus:text-gold-500 active:text-gold-300"
					>{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
