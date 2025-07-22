<script lang="ts">
	import { formatStringList } from '$lib/utils/common';
	const { data } = $props();
</script>

<svelte:head>
	<title>Content</title>
</svelte:head>

{#if data.content && data.content.length > 0}
	<h1>Our Content</h1>
	<ul>
		{#each data.content as post}
			<li>
				<a href="/content/{post.slug}"><h2>{post.title}</h2></a>
				<p>Published: {new Date(post.publishedAt).toString()}</p>
				<p>By: {formatStringList(post.authors.map((author) => author.name))}</p>
				<p>In: {formatStringList(post.categories.map((category) => category.title))}</p>
			</li>
		{/each}
	</ul>
{:else}
	<h1>Coming Soon!</h1>
	<p>We are working hard to bring you the best content. Stay tuned for updates!</p>
{/if}
