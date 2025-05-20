<script lang="ts">
	import { chainList, chains } from '$lib/utils/chains';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { EnvisionButton, EnvisionSelect } from '@envisionly/envisiontech-core';
	import { onMount } from 'svelte';

	let id = $state('');
	let chain = $state('');
	let savedSearches: Array<{
		id: number;
		type: string;
		chain: string;
		name: string;
		value: string;
	}> = $state([]);
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
	let save = $state(false);
	let name = $state('');

	onMount(() => {
		if (localStorage.getItem('savedSearches')) {
			savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
		} else {
			savedSearches = [];
		}
	});

	function saveSearch() {
		if (dev) {
			console.log('Saving search:', { searchType, id, name });
		}
		const newSearch = {
			id: Date.now(),
			type: searchType,
			name,
			chain,
			value: id
		};
		savedSearches.push(newSearch);
		localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
		if (dev) {
			console.log('Saved searches:', savedSearches);
		}
	}

	function deleteSavedSearch(id: number) {
		if (dev) {
			console.log('Deleting search:', id);
		}
		savedSearches = savedSearches.filter((search) => search.id !== id);
		localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
		if (dev) {
			console.log('Saved searches:', savedSearches);
		}
	}
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="Search for a token by its ID" />
</svelte:head>

<h1>Search</h1>

<p>Search for a token or pair by its ID.</p>

{#if savedSearches.length > 0}
	<h2>Saved Searches</h2>
	<ul>
		{#each savedSearches as search (search.id)}
			<li>
				<a href={`/${search.type}/${search.value}?chain=${search.chain}`}>
					{search.name} ({search.type} from {chains[search.chain as keyof typeof chains].name}): {search.value}
				</a>
				<EnvisionButton
					size="small"
					text={`Delete ${search.name}`}
					onclick={() => deleteSavedSearch(search.id)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<h2>New Search</h2>
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

<div>
	<EnvisionSelect label="Chain" options={chainList} search bind:value={chain} />
</div>

<label for="search">{searchTypes[searchType].label} ID:</label>
<input id="search" type="text" bind:value={id} placeholder="Enter the ID..." />

<div>
	<input type="checkbox" id="save" bind:checked={save} />
	<label for="save">Save this search</label>
</div>

{#if save}
	<div>
		<label for="save-name">Name:</label>
		<input id="save-name" type="text" bind:value={name} placeholder="Enter a name..." />
	</div>
{/if}

<EnvisionButton
	onclick={() => {
		if (save) {
			saveSearch();
		}
		goto(`/${searchType}/${id}?chain=${chain}`);
	}}>Search</EnvisionButton
>
