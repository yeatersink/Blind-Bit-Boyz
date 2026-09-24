<script lang="ts">
	import { storyChapters } from '$lib/story/chapters';
</script>

<svelte:head>
	<title>Learn — Blind Bit Boys</title>
	<meta
		name="description"
		content="Fifteen learn pages, one for each chapter of the Blind Bit Boys story. Education, not financial advice."
	/>
</svelte:head>

<h1>Learn</h1>
<p>
	Fifteen longer pages, one for each chapter on the homepage, including custody, block explorers, and
	privacy. Each page links back to its place in the story.
</p>
<ul class="learn-index">
	{#each storyChapters as chapter (chapter.slug)}
		<li>
			<h2>
				<a class="story-link" href="/learn/{chapter.slug}">{chapter.label}. {chapter.title}</a>
			</h2>
		</li>
	{/each}
</ul>
<p>Not financial advice. These pages are education, as of September 2026.</p>
