<script lang="ts">
	import '../app.css';
	import DesktopNav from '../components/DesktopNav.svelte';
	let { children } = $props();
</script>

<header>
	<DesktopNav />
</header>
<main>
	{@render children()}
</main>
<footer><h2>Follow Us:</h2>
<a href="https://x.com/yeatersink">X</a>
</footer>