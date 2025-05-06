<script lang="ts">
	import { goto } from '$app/navigation';
	import { EnvisionButton } from '@envisionly/envisiontech-core';

	let id = $state('');
</script>

<svelte:head>
	<title>Token Search</title>
	<meta name="description" content="Search for a token by its ID" />
</svelte:head>

<h1>Token Search</h1>
<label for="token-id">Token ID:</label>
<input autofocus id="token-id" type="text" bind:value={id} placeholder="Enter token ID" />
<EnvisionButton onclick={() => goto(`/tokens/${id}`)}>Search</EnvisionButton>
