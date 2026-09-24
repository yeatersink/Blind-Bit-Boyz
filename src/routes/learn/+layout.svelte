<script lang="ts">
	let { children } = $props();
</script>

<div class="learn-shell">
	<nav aria-label="Learn">
		<ul>
			<li><a class="story-link" href="/">Home</a></li>
			<li><a class="story-link" href="/learn">Learn</a></li>
			<li><a class="story-link" href="/search">Search</a></li>
		</ul>
	</nav>
	{@render children()}
</div>
