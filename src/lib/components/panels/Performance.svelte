<script lang="ts">
	import {
		formatCryptoPrice,
		formatLargeNumber,
		formatPercentage
	} from '$lib/utils/formatting.svelte';

	let {
		priceChange,
		volumeChange,
		netVolumeChange,
		liquidityChange,
		holdersChange,
		experiencedNetBuyersChange
	}: {
		priceChange: Record<string, number> | null;
		volumeChange: Record<string, number> | null;
		netVolumeChange: Record<string, number> | null;
		liquidityChange: Record<string, number> | null;
		holdersChange: Record<string, number> | null;
		experiencedNetBuyersChange: Record<string, number> | null;
	} = $props();

	let tableData: Array<String[]> | null = $state(null);

	function generateTable() {
		let headers: string[] = [];
		if (priceChange) {
			headers = Object.keys(priceChange);
			headers.unshift('Metric');
			tableData = [headers];

			const values = headers.map((key) =>
				key === 'Metric' ? 'Price Change' : formatPercentage(priceChange[key])
			);
			tableData.push(values);
		}
		if (volumeChange) {
			if (!tableData) {
				headers = Object.keys(volumeChange);
				headers.unshift('Metric');
				tableData = [headers];
			}

			const values = headers.map((key) =>
				key === 'Metric'
					? 'Volume Change'
					: formatLargeNumber(volumeChange[key], undefined, true, '$')
			);
			tableData.push(values);
		}
		if (netVolumeChange) {
			if (!tableData) {
				headers = Object.keys(netVolumeChange);
				headers.unshift('Metric');
				tableData = [headers];
			}

			const values = headers.map((key) =>
				key === 'Metric'
					? 'Net Volume Change'
					: formatLargeNumber(netVolumeChange[key], undefined, true, '$')
			);
			tableData.push(values);
		}
		if (liquidityChange) {
			if (!tableData) {
				headers = Object.keys(liquidityChange);
				headers.unshift('Metric');
				tableData = [headers];
			}

			const values = headers.map((key) =>
				key === 'Metric'
					? 'Liquidity Change'
					: formatLargeNumber(liquidityChange[key], undefined, true, '$')
			);
			tableData.push(values);
		}
		if (holdersChange) {
			if (!tableData) {
				headers = Object.keys(holdersChange);
				headers.unshift('Metric');
				tableData = [headers];
			}

			const values = headers.map((key) =>
				key === 'Metric' ? 'Holders Change' : formatLargeNumber(holdersChange[key], 0, true)
			);
			tableData.push(values);
		}
		if (experiencedNetBuyersChange) {
			if (!tableData) {
				headers = Object.keys(experiencedNetBuyersChange);
				headers.unshift('Metric');
				tableData = [headers];
			}

			const values = headers.map((key) =>
				key === 'Metric'
					? 'Experienced Net Buyers Change'
					: formatLargeNumber(experiencedNetBuyersChange[key], 0, true)
			);
			tableData.push(values);
		}
	}

	generateTable();
</script>

<wa-card>
	<div slot="header">
		<h2>Performance</h2>
	</div>

	{#if tableData}
		<table>
			<thead>
				<tr>
					{#each tableData[0] as header}
						<th>{header}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each tableData.slice(1) as row, index}
					<tr>
						{#each row as value}
							<td>{value}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>No performance data available.</p>
	{/if}
</wa-card>
