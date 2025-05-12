<script lang="ts">
	import { goto } from '$app/navigation';
	import { EnvisionButton } from '@envisionly/envisiontech-core';

	let id = $state('');
	const searchTypes: {
		[key: string]: {
			label: string;
		};
	} = {
		token: {
			label: 'Token'
		},
		pair: {
			label: 'Pair'
		}
	};
	let searchType = $state('token');
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="Search for a token by its ID" />
</svelte:head>

<h1>Search</h1>
<fieldset>
	<legend>What would you like to search for?</legend>
	{#each Object.entries(searchTypes) as [key, { label }], i (key)}
		<label for={key}>{label}</label>
		<input
			defaultChecked={i === 0}
			type="radio"
			id={key}
			name="search-type"
			value={key}
			bind:group={searchType}
		/>
	{/each}
</fieldset>
<label for="search">{searchTypes[searchType].label} ID:</label>
<input id="search" type="text" bind:value={id} placeholder="Enter the ID..." />
<EnvisionButton onclick={() => goto(`/${searchType}/${id}`)}>Search</EnvisionButton>
