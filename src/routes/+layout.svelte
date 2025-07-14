<script lang="ts">
	import '@awesome.me/webawesome/dist/styles/webawesome.css';
	import '@fortawesome/fontawesome-free/css/all.css';
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import '../app.css';
	import DesktopNav from '$lib/components/DesktopNav.svelte';

	let { children } = $props();
</script>

<a class="sr-only" href="#main">Skip to main content</a>
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

<main id="main" class="flex-grow bg-gray-900 text-gray-100">
	{@render children()}
</main>

<footer class="border-gold-500 border-t bg-black py-8 text-gray-400">
	<h2 class="mb-4 text-xl font-semibold text-gray-200">Follow Us:</h2>
	<wa-button href="https://x.com/yeatersink">
		<wa-icon family="brands" name="x" label="X"></wa-icon>
	</wa-button>
	<!-- replacing github link with wa-->
	<wa-button href="https://github.com/yeatersink">
		<wa-icon family="brands" name="github" label="GitHub"></wa-icon>
	</wa-button>
</footer>
<a class="sr-only" href="#main">Back to main content</a>
