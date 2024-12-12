<script lang="ts">
	let currentTab:string=$state('panel-coin-details');

	const {data} = $props()

	function formatNumberWithDecimals(number:string, decimals:string) {
		    return (parseInt(number)/(10**parseInt(decimals))).toFixed(parseInt(decimals))
	}
</script>

<svelte:head>
	{#if data.pair}
		<title>{data.pair.baseToken.name}</title>
	{/if}
</svelte:head>

{#if data.pair}
	<h1>{data.pair.baseToken.name}</h1>

		<div>
			<section role="tablist" class="flex">
					<button
						aria-selected={currentTab==='panel-coin-details'}
						aria-controls="panel-coin-details"
						tabindex={currentTab==='panel-coin-details'?0:-1}
						role="tab"
onclick={() => currentTab='panel-coin-details'}
>Details</button
					>
					<button
						aria-selected={currentTab==='panel-technical-analysis'}
						aria-controls="panel-technical-analysis"
						tabindex={currentTab==='panel-technical-analysis'?0:-1}
						role="tab"
onclick={() => currentTab='panel-technical-analysis'}
>Technical Analysis</button
					>
			</section>
		</div>

<div class={`${currentTab!='panel-coin-details'?'hidden':''}`} role="tabpanel" id="panel-coin-details" aria-label="Coin Details">
</div>
<div class={`${currentTab!='panel-technical-analysis'?'hidden':''}`} role="tabpanel" id="panel-technical-analysis" aria-label="Technical Analysis">
<p>Chart Goes Here</p>
</div>
{/if}