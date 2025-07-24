<script lang="ts">
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import { savedSearchService, type SavedSearch } from '$lib/utils/saved.svelte';

	let { chainId, name, address, type }: SavedSearch = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<wa-button
	variant="neutral"
	appearance="plain"
	onclick={() => {
		if (savedSearchService.has(address, chainId)) {
			savedSearchService.remove(address, chainId);
		} else {
			savedSearchService.add(address, name, chainId, type);
		}
	}}
	><wa-icon
		variant={savedSearchService.has(address, chainId) ? 'solid' : 'regular'}
		name="bookmark"
		label={savedSearchService.has(address, chainId) ? 'Remove bookmark' : 'Add bookmark'}
	></wa-icon></wa-button
>
