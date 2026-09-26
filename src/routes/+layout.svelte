<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.css';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import '../app.css';
	import DesktopNav from '$lib/components/DesktopNav.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
	let isStory = $derived($page.url.pathname === '/');
</script>

<a class="skip-link" href={isStory ? '#story' : '#main'}>
	{isStory ? 'Skip to story' : 'Skip to main content'}
</a>
<header class="border-gold-500 sticky top-0 z-50 border-b bg-black text-gray-100 shadow-lg">
	<div class="container mx-auto flex items-center justify-between px-6 py-4">
		<img
			src="/bbb-logo.png"
			class="h-24 w-auto"
			alt="The Bitcoin symbol is white and placed in the center of a circular background that transitions from gold in the middle to a gray border. The symbol is depicted as a person with a black blindfold, extending an arm to touch a black silhouette of a guide dog on the left. The other arm is holding a white cane with a red tip on the right."
		/>
		<DesktopNav />
	</div>
</header>

<div class="relative z-10 flex min-h-0 flex-grow flex-col">
	{#if isStory}
		{@render children()}
	{:else}
		<main id="main" class="flex-grow bg-gray-900 text-gray-100" tabindex="-1">
			{@render children()}
		</main>
	{/if}
</div>

<footer class="border-gold-500 relative z-0 border-t bg-black py-10 text-gray-100">
	<div class="mx-auto max-w-5xl px-6">
		<div>
			<h2 class="text-xl font-semibold text-gray-100">Social Media Links to Follow</h2>
			<ul class="mt-4 list-none space-y-3 pl-0">
				<li>
					<a
						class="story-link"
						href="https://x.com/yeatersink"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="fa-brands fa-x-twitter mr-2" aria-hidden="true"></i>
						X (Blind Bit Boys)
						<span class="sr-only">(opens in a new tab)</span>
					</a>
				</li>
				<li>
					<a
						class="story-link"
						href="https://x.com/LibertySwapFi"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="fa-brands fa-x-twitter mr-2" aria-hidden="true"></i>
						X (Liberty Swap)
						<span class="sr-only">(opens in a new tab)</span>
					</a>
				</li>
				<li>
					<a
						class="story-link"
						href="https://x.com/zkxwallet"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="fa-brands fa-x-twitter mr-2" aria-hidden="true"></i>
						X (ZKX Wallet)
						<span class="sr-only">(opens in a new tab)</span>
					</a>
				</li>
				<li>
					<a
						class="story-link"
						href="https://github.com/yeatersink"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="fa-brands fa-github mr-2" aria-hidden="true"></i>
						GitHub
						<span class="sr-only">(opens in a new tab)</span>
					</a>
				</li>
			</ul>
			<p class="mt-6 text-gray-200">Educational site. Not financial advice.</p>
		</div>
	</div>
</footer>
{#if !isStory}
	<a class="skip-link" href="#main">Back to main content</a>
{/if}
