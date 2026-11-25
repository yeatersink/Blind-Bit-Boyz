<script lang="ts">
	import { t } from '$lib/i18n/preferences.svelte';

	let { text }: { text: string } = $props();

	type Part = { kind: 'text'; text: string } | { kind: 'link'; label: string; href: string };

	const parts = $derived(parse(text));

	function parse(value: string): Part[] {
		const out: Part[] = [];
		const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
		let cursor = 0;
		for (const match of value.matchAll(pattern)) {
			const index = match.index ?? 0;
			if (index > cursor) out.push({ kind: 'text', text: value.slice(cursor, index) });
			out.push({ kind: 'link', label: match[1], href: match[2] });
			cursor = index + match[0].length;
		}
		if (cursor < value.length) out.push({ kind: 'text', text: value.slice(cursor) });
		return out;
	}

	function external(href: string): boolean {
		return /^https?:\/\//i.test(href);
	}
</script>

{#each parts as part, index (index)}
	{#if part.kind === 'text'}
		{part.text}
	{:else if external(part.href)}
		<a class="story-link" href={part.href} target="_blank" rel="noopener noreferrer">
			{part.label}
			<span class="sr-only"> {t('footer.newTab')}</span>
		</a>
	{:else}
		<a class="story-link" href={part.href}>{part.label}</a>
	{/if}
{/each}
