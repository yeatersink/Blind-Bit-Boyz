<script lang="ts">
	import { PortableText } from '@portabletext/svelte';
	const { data } = $props();
</script>

<svelte:head>
	<title>{data.author ? data.author.name : 'Author not found'}</title>
</svelte:head>

{#if data.author}
	<h1>{data.author.name}</h1>
	<PortableText value={data.author.bio} />
	<h2>Contact</h2>
	{#if data.author.email}
		<p>Email: <a href={`mailto:${data.author.email}`}>{data.author.email}</a></p>
	{/if}
	{#if data.author.socials && data.author.socials.length > 0}
		{#each data.author.socials as social}
			<a href={social.url} target="_blank" rel="noopener noreferrer"> {social.platform}</a>
		{/each}
	{/if}
{:else}
	<h1>Author Not Found</h1>
	<p>This author does not exist or has been removed.</p>
{/if}
