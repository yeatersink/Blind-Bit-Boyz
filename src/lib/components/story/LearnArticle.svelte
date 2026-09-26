<script lang="ts">
	import type { Snippet } from 'svelte';
	import { chapterNeighbors, type StorySlug } from '$lib/story/chapters';

	let { slug, children }: { slug: StorySlug; children: Snippet } = $props();

	const neighbors = $derived(chapterNeighbors(slug));
</script>

<svelte:head>
	<title>{neighbors.current.title} — Blind Bit Boys</title>
	<meta
		name="description"
		content="{neighbors.current.title}. A Blind Bit Boys learn page. Education, not financial advice. As of September 2026."
	/>
</svelte:head>

<article>
	<h1>{neighbors.current.title}</h1>
	{@render children()}
	<nav aria-label="This chapter">
		<p>
			<a class="story-link" href="/#{neighbors.current.id}"
				>Back to {neighbors.current.label} on the story</a
			>
		</p>
		<ul>
			{#if neighbors.prev}
				<li>
					<a class="story-link" href="/learn/{neighbors.prev.slug}"
						>Previous: {neighbors.prev.title}</a
					>
				</li>
			{/if}
			{#if neighbors.next}
				<li>
					<a class="story-link" href="/learn/{neighbors.next.slug}"
						>Next: {neighbors.next.title}</a
					>
				</li>
			{/if}
		</ul>
	</nav>
	<p>
		<a class="story-cta" href="/search">Search tokens</a>
	</p>
	<p>
		Not financial advice. This page is education, as of September 2026. It is not a recommendation to
		buy, sell, bridge, stake, or sign a transaction, and it is not a promise about price or yield.
	</p>
</article>
