<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.css';
	import '../app.css';
	import DesktopNav from '../components/DesktopNav.svelte';
	let { children } = $props();
</script>

<header class="sticky top-0 z-50 border-b border-gold-500 bg-black text-gray-100 shadow-lg">
	<div class="container mx-auto flex items-center justify-between px-6 py-4">
		<img src="/bbb-logo.png" class="h-24 w-auto" alt="Blind Bit Boyz Logo" />
		<DesktopNav />
	</div>
</header>

<main class="flex-grow bg-gray-900 text-gray-100">
	{@render children()}
</main>

<footer class="border-t border-gold-500 bg-black py-8 text-gray-400">
	<h2 class="mb-4 text-xl font-semibold text-gray-200">Follow Us:</h2>
	<a
		class="text-gray-400 hover:text-gold-500 focus:text-gold-500"
		href="https://x.com/yeatersink"
		aria-label="X"><span class="fa-brands fa-x"></span></a
	>
	<a
		href="https://github.com/yeatersink"
		class="text-gray-400 hover:text-gold-500 focus:text-gold-500"
		aria-label="GitHub"><span class="fa-brands fa-github"></span></a
	>
</footer>
