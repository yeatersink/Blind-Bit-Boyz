<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="chains">
	<p>
		Bitcoin and Ethereum are not the only ledgers. Each network below settles its own record, or, in
		the case of a layer 2, posts that record back to Ethereum. PulseChain is where the tools on this
		site are tested. It is one chain on this list.
	</p>

	<h2>A short comparison</h2>
	<div class="learn-table">
		<table>
			<caption>Settlement, virtual machine, fee idea, and official site</caption>
			<thead>
				<tr>
					<th scope="col">Network</th>
					<th scope="col">What settles the record</th>
					<th scope="col">EVM or not</th>
					<th scope="col">Fee idea</th>
					<th scope="col">Official site</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th scope="row">Bitcoin</th>
					<td>Its own miners. Proof of work.</td>
					<td>Not the EVM. The script system is for payments.</td>
					<td>A market fee per transaction. It rises when blocks are full.</td>
					<td><a class="story-link" href="https://bitcoin.org/">Bitcoin.org</a></td>
				</tr>
				<tr>
					<th scope="row">Ethereum</th>
					<td>Its own validators.</td>
					<td>Yes. This is the EVM other chains copy.</td>
					<td>Gas on layer 1. Often the expensive reference for the chains below.</td>
					<td><a class="story-link" href="https://ethereum.org/">Ethereum</a></td>
				</tr>
				<tr>
					<th scope="row">Solana</th>
					<td>Its own validators and a different runtime.</td>
					<td>Not the EVM.</td>
					<td>Built for high throughput. Fees are a different design from Ethereum gas.</td>
					<td><a class="story-link" href="https://solana.com/">Solana</a></td>
				</tr>
				<tr>
					<th scope="row">BNB Chain</th>
					<td>Its own validators. Associated with the Binance ecosystem. It is not Binance the exchange.</td>
					<td>Yes. MetaMask-style wallets can add it.</td>
					<td>Often lower than Ethereum layer 1. You still pay the chain, not the exchange.</td>
					<td>
						<a class="story-link" href="https://www.bnbchain.org/">BNB Chain</a>
						and
						<a class="story-link" href="https://docs.bnbchain.org/">BNB Chain docs</a>
					</td>
				</tr>
				<tr>
					<th scope="row">Ethereum layer 2s</th>
					<td>Execution is cheaper off layer 1. The rollup posts data to Ethereum, which settles it.</td>
					<td>The ones named on the story are EVM rollups. You still add that network in the wallet.</td>
					<td>Usually cheaper than the same action on Ethereum layer 1. Bridging in or out is a separate step.</td>
					<td>
						<a class="story-link" href="https://ethereum.org/en/layer-2/">Ethereum’s layer 2 explainer</a>
					</td>
				</tr>
				<tr>
					<th scope="row">PulseChain</th>
					<td>Its own validators. An Ethereum-style chain that launched in May 2023.</td>
					<td>Yes. The coin is PLS.</td>
					<td>Cheaper fees than Ethereum layer 1, paid in PLS.</td>
					<td><a class="story-link" href="https://pulsechain.com/">PulseChain</a></td>
				</tr>
			</tbody>
		</table>
	</div>

	<h2>Own layer 1</h2>
	<p>
		An own layer 1 settles on its own validators or miners. Bitcoin, Ethereum, Solana, BNB Chain, and
		PulseChain are each their own layer 1. A bridge between them moves a representation of an asset.
		It does not merge their security. BNB Chain has its own validator set and its own risks. Holding
		an account at Binance the company is a different fact from holding a token on BNB Chain.
	</p>

	<h2>Layer 2</h2>
	<p>
		A rollup executes transactions away from Ethereum layer 1 and posts the data, or a proof, back to
		Ethereum. Users pay less because the heavy work is batched. Optimistic-style rollups include
		Arbitrum and Optimism. Base is an OP-stack chain in that family. ZK-style examples include
		zkSync, Scroll, and Linea. They use proofs instead of a waiting period, and the designs differ.
	</p>
	<p>
		To use one, the wallet needs that layer 2 added as a network. You arrive with a bridge or an
		official on-ramp. A token can keep a familiar name and still be a different contract until it is
		bridged. The balance on Arbitrum is not the same contract entry as the balance on Ethereum layer
		1.
	</p>

	<h2>Sidechain</h2>
	<p>
		A sidechain is its own chain, with its own validators, connected to another chain by a bridge. It
		is not a rollup: Ethereum does not settle the sidechain’s blocks. If the sidechain’s validators
		fail, the bridge does not inherit Ethereum’s security by itself. PulseChain is not an Ethereum
		layer 2. It is its own layer 1 that speaks the EVM and links to Ethereum through a bridge.
	</p>

	<h2>PulseChain, up close</h2>
	<p>
		PulseChain launched in May 2023. Fees are cheaper than on Ethereum layer 1. The coin is PLS.
		<a class="story-link" href="https://pulsex.com/">PulseX</a> is the main decentralized exchange.
		<a class="story-link" href="https://bridge.pulsechain.com/">The official bridge</a>
		moves assets between Ethereum and PulseChain.
		<a class="story-link" href="https://scan.pulsechain.com/">scan.pulsechain.com</a>
		describes itself as where to scan PulseChain. It shows blocks and transactions the network has
		accepted. The scanner is still a website in front of a node.
		<a class="story-link" href="/learn/nodes">Running your own node</a> is how you check that record yourself.
	</p>
</LearnArticle>
