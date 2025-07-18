<script lang="ts">
	let {
		priceChange,
		volumeChange,
		liquidityChange
	}: {
		priceChange: Record<string, number> | null;
		volumeChange: Record<string, number> | null;
		liquidityChange: Record<string, number> | null;
	} = $props();

	let tableData: Array<String[]> | null = $state(null);

	function generateTable() {
		let headers: string[] = [];
		if (priceChange) {
			headers = Object.keys(priceChange);
			headers.unshift('Metric');
			tableData = [headers];

			const values = headers.map((key) =>
				key === 'Metric' ? 'Price Change' : priceChange[key].toFixed(2) + '%'
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
				key === 'Metric' ? 'Volume Change' : volumeChange[key] ? '$' + volumeChange[key] : 'N/A'
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
					: liquidityChange[key]
						? '$' + liquidityChange[key]
						: 'N/A'
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
