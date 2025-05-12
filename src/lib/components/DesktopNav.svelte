<script lang="ts">
	import { navItems } from '$lib/utils/navManager';
	import { page } from '$app/stores';
</script>

<nav aria-label="Global">
	<ul class="flex space-x-4">
		{#each navItems as { name, url }}
			<li>
				<a
					href={url}
					aria-current={url === $page.url.pathname ? 'page' : undefined}
					class:active={url === $page.url.pathname}
					class="hover:text-gold-500 focus:text-gold-500 active:text-gold-300 text-gray-400"
					>{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
