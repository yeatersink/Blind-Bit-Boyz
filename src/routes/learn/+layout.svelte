<script lang="ts">
	import { page } from '$app/state';
	import { learnPhoto } from '$lib/story/chapters';

	let { children } = $props();

	const photo = $derived(learnPhoto(page.url.pathname.match(/^\/learn\/([^/]+)\/?$/)?.[1]));
</script>

<div
	class="learn-stage"
	class:learn-photo={photo !== null}
	style:--learn-photo={photo ? `url('${photo}')` : undefined}
>
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
</div>
