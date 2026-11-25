<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.css';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import '../app.css';
	import { onMount } from 'svelte';
	import DesktopNav from '$lib/components/DesktopNav.svelte';
	import SiteToolbar from '$lib/components/SiteToolbar.svelte';
	import { initPreferences, t } from '$lib/i18n/preferences.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
	let isStory = $derived($page.url.pathname === '/');

	onMount(() => {
		void initPreferences();
	});
</script>

<a class="skip-link" href={isStory ? '#story' : '#main'}>
	{isStory ? t('skip.story') : t('skip.main')}
</a>
<header class="border-gold-500 sticky top-0 z-50 border-b bg-black text-gray-100 shadow-lg">
	<div class="site-header">
		<img src="/bbb-logo.png" class="site-logo" alt={t('logo.alt')} />
		<div class="site-header-end">
			<DesktopNav />
			<SiteToolbar />
		</div>
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
			<h2 class="text-xl font-semibold text-gray-100">{t('footer.social')}</h2>
			<ul class="mt-4 list-none space-y-3 pl-0">
				<li>
					<a
						class="story-link"
						href="https://x.com/yeatersink"
						target="_blank"
						rel="noopener noreferrer"
					>
						<i class="fa-brands fa-x-twitter mr-2" aria-hidden="true"></i>
						{t('footer.xBbb')}
						<span class="sr-only">{t('footer.newTab')}</span>
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
						{t('footer.xLiberty')}
						<span class="sr-only">{t('footer.newTab')}</span>
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
						{t('footer.xZkx')}
						<span class="sr-only">{t('footer.newTab')}</span>
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
						{t('footer.github')}
						<span class="sr-only">{t('footer.newTab')}</span>
					</a>
				</li>
			</ul>
			<p class="mt-6 text-gray-200">{t('footer.disclaimer')}</p>
		</div>
	</div>
</footer>
{#if !isStory}
	<a class="skip-link" href="#main">{t('skip.back')}</a>
{/if}
