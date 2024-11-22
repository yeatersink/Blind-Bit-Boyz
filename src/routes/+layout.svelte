<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<header><a href="/">Home</a></header>
<main>
	{@render children()}
</main>
<footer><h2>Follow Us:</h2>
<a href="x.com/yeatersink?s=11">X</a>
</footer>