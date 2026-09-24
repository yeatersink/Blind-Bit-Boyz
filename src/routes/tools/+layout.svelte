<script lang="ts">
	let { children } = $props();
</script>

<div class="learn-shell">
	<nav aria-label="Tools">
		<ul>
			<li><a class="story-link" href="/">Home</a></li>
			<li><a class="story-link" href="/tools">Accessible tools</a></li>
			<li><a class="story-link" href="/search">Search tokens</a></li>
			<li><a class="story-link" href="/learn">Learn</a></li>
			<li><a class="story-link" href="/instructions">Instructions</a></li>
			<li><a class="story-link" href="/official-links">Official Links</a></li>
		</ul>
	</nav>
	{@render children()}
</div>
