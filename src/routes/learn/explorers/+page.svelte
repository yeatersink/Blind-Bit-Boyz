<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="explorers">
	<p>
		A block explorer is a search engine for one chain. You look up an address, a transaction hash, a
		token, or a block. It reads public data, often from a node or from an indexer in front of that
		node. It does not move funds, and it does not hold your keys.
	</p>

	<h2>What an explorer shows</h2>
	<p>
		A transaction page shows the sender, the receiver, the amount, the fee, and a status such as
		success or failure. A block page shows the transactions that landed together. Two explorers can
		read the same chain and still disagree on a token’s name or a label. The chain is the record.
		The site is a view of it.
	</p>
	<p>
		Those fields are text. JAWS or NVDA can read them when the explorer page exposes that text. This
		page does not certify those sites for any screen reader.
	</p>

	<h2>How to paste an address</h2>
	<p>
		Check the domain before you paste. Use a host from the list below or from
		<a class="story-link" href="/official-links">Official Links</a>. Copy the address from your wallet.
		Paste it into the explorer’s search. Read the page that opens. Paste an address or a transaction
		hash. Do not paste a seed phrase. The explorer does not need one, and a box that asks for one is
		not an explorer.
	</p>

	<h2>How to read a transaction</h2>
	<p>After you paste a transaction hash, read these fields in order:</p>
	<ol>
		<li>Status. Success means the chain accepted it. Failure means it did not, and the fee can still be gone.</li>
		<li>From. The address that signed the transaction.</li>
		<li>To. The address or the contract that received it.</li>
		<li>Amount. What moved, and which token. A token transfer can sit inside a contract call.</li>
		<li>Fee. What the sender paid the network. The explorer did not collect that fee.</li>
		<li>Block. The block that contains the transaction, once it is included.</li>
	</ol>

	<h2>Token holders are public</h2>
	<p>
		A token page can include a holders tab. That list is public. Anyone can see addresses that hold
		the token and, on many explorers, how much. Looking yourself up does not make the holding
		private. Do not treat a holder list as a secret, and do not assume a label on an address is the
		person’s legal name.
	</p>

	<h2>Hosts linked here</h2>
	<p>
		mempool.space did not open when this page was checked, so it is not linked. pulsechain.com and
		scan.pulsechain.com do not link an Otterscan host, so this page does not guess one.
		pulsechain.com lists ipfs.scan.pulsechain.com as its block explorer URL.
	</p>
	<ul>
		<li>Bitcoin: <a class="story-link" href="https://blockstream.info/">Blockstream</a></li>
		<li>
			Ethereum:
			<a class="story-link" href="https://etherscan.io/">Etherscan</a>,
			<a class="story-link" href="https://otterscan.io/">Otterscan</a>,
			<a class="story-link" href="https://eth.blockscout.com/">Blockscout</a>
		</li>
		<li>
			PulseChain:
			<a class="story-link" href="https://scan.pulsechain.com/">scan.pulsechain.com</a>
			and
			<a class="story-link" href="https://ipfs.scan.pulsechain.com/">ipfs.scan.pulsechain.com</a>
		</li>
		<li>BNB Chain: <a class="story-link" href="https://bscscan.com/">BscScan</a></li>
		<li>
			Solana:
			<a class="story-link" href="https://explorer.solana.com/">Solana Explorer</a>
			and
			<a class="story-link" href="https://solscan.io/">Solscan</a>
		</li>
		<li>Polygon: <a class="story-link" href="https://polygonscan.com/">PolygonScan</a></li>
		<li>Avalanche C-Chain: <a class="story-link" href="https://snowtrace.io/">Snowtrace</a></li>
		<li>Arbitrum: <a class="story-link" href="https://arbiscan.io/">Arbiscan</a></li>
		<li>Base: <a class="story-link" href="https://basescan.org/">BaseScan</a></li>
	</ul>
	<p>
		The same hosts are grouped on
		<a class="story-link" href="/official-links">Official Links</a>. What a public explorer means for
		privacy is <a class="story-link" href="/learn/privacy">chapter 13</a>.
	</p>
</LearnArticle>
