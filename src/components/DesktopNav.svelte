<script lang="ts">
	import { page } from '$app/stores';
	let navItems = [
		{ name: 'Home Page', url: '/' },
			{ name: 'Blockchain and Exchanges', url: '/block_chain' },
				{ name: 'Digital Wallets', url: '/wallet' },
					{ name: 'How to Get Started with Crypto', url: '/tools' },
						{ name: 'Token Search and Analysis', url: '/coin-search' },
		{ name: 'Liquidity and Liquidity Providing', url: '/liquidity' },
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
