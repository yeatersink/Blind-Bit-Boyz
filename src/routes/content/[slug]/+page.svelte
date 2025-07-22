<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	import { formatStringList } from '$lib/utils/common';
	const { data } = $props();
</script>

<svelte:head>
	<title>{data.post ? data.post.title : 'Post not found'}</title>
</svelte:head>

{#if data.post}
	<h1>{data.post.title}</h1>
	<p>Published: {new Date(data.post.publishedAt).toString()}</p>
	<p>
		By: {#each data.post.authors as author, i}
			<a href="/authors/{author.slug}">{author.name}</a>
			{#if i < data.post.authors.length - 2},
			{:else if i === data.post.authors.length - 2}, and
			{/if}
		{/each}
	</p>
	<p>In: {formatStringList(data.post.categories.map((category) => category.title))}</p>
	<PortableText value={data.post.body} />
{:else}
	<h1>Post Not Found</h1>
	<p>This post does not exist or has been removed.</p>
{/if}
