<script lang="ts">
	import type { Snippet } from 'svelte';
	import { chapterNeighbors, type StorySlug } from '$lib/story/chapters';

	let { slug, children }: { slug: StorySlug; children: Snippet } = $props();

	const { current, prev, next } = chapterNeighbors(slug);
</script>

<svelte:head>
	<title>{current.title} — Blind Bit Boys</title>
	<meta
		name="description"
		content="{current.title}. A Blind Bit Boys learn page. Education, not financial advice. As of September 2026."
	/>
</svelte:head>

<article>
	<h1>{current.title}</h1>
	{@render children()}
	<nav aria-label="This chapter">
		<p>
			<a class="story-link" href="/#{current.id}">Back to {current.label} on the story</a>
		</p>
		<ul>
			{#if prev}
				<li>
					<a class="story-link" href="/learn/{prev.slug}">Previous: {prev.title}</a>
				</li>
			{/if}
			{#if next}
				<li>
					<a class="story-link" href="/learn/{next.slug}">Next: {next.title}</a>
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
