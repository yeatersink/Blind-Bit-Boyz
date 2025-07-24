<script lang="ts">
	import '@awesome.me/webawesome/dist/components/button/button.js';
	import '@awesome.me/webawesome/dist/components/icon/icon.js';
	import { savedSearchService } from '$lib/utils/saved.svelte';

	interface Props {
		address: string;
		chainId: string;
	}

	let { address, chainId }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<wa-button
	variant="neutral"
	appearance="plain"
	onclick={() => savedSearchService.remove(address, chainId)}
	><wa-icon variant="solid" name="trash" label="Delete search"></wa-icon></wa-button
>
