<script lang="ts">
	const {data} = $props()
</script>

{#if data.data.result}
	<h1>{data.data.result.name}</h1>
<p>Address: {data.data.result.contractAddress}</p>
<button onclick={() => navigator.clipboard.writeText(data.data.result.contractAddress)}>Copy Address</button>
<p>Symbol: {data.data.result.symbol}</p>
<p>Type: {data.data.result.type}</p>
<p>Decimals: {data.data.result.decimals}</p>
<p>Total Supply: {data.data.result.totalSupply}</p>
{JSON.stringify(data.data.result)}
{/if}