<script lang="ts">
	import { page } from '$app/stores';
	let navItems = [
		{ name: 'Home', url: '/' },
		{ name: 'Coin Search', url: '/coin-search' },
		{ name: 'Wallet', url: '/wallet' },
		{ name: 'Tools', url: '/tools' },
		{ name: 'Liquidity and LP', url: '/liquidity' },
		{ name: 'Block Chain', url: '/block_chain' },
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
