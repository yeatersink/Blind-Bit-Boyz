<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="bitcoin">
	<p>
		In 2008 and 2009, Satoshi Nakamoto published a paper for sending value online without a bank
		clearing the payment. Satoshi Nakamoto is the name on that paper.
	</p>
	<h2>A shared ledger</h2>
	<p>
		A blockchain is a shared ledger. Transactions are grouped into blocks. Each block is linked to
		the one before it by a hash, a short fingerprint of the earlier block. If someone changes an old
		block, the fingerprints no longer match, and the rest of the network can see the break.
	</p>
	<p>
		No single company keeps the only copy. Many computers hold the ledger, and the network agrees on
		which chain of blocks is the record.
	</p>
	<h2>Buys and sells are UTXO transfers</h2>
	<p>
		On Bitcoin, a coin you can spend is an unspent transaction output, called a UTXO. A payment
		points at outputs you already received and creates new outputs for the next owners. The
		transfer is broadcast to the network. Miners can put it in a block. It is settled as more blocks
		are built on top of that one. More confirmations mean more work would have to be redone to
		change that payment.
	</p>
	<h2>Read the source</h2>
	<p>
		<a class="story-link" href="https://bitcoin.org/bitcoin.pdf"
			>Bitcoin: A Peer-to-Peer Electronic Cash System (PDF)</a
		>
		is the white paper.
		<a class="story-link" href="https://bitcoin.org/">Bitcoin.org</a> is the project site. Running the
		software yourself is covered in
		<a class="story-link" href="/learn/nodes">Running your own node</a>.
	</p>
</LearnArticle>
