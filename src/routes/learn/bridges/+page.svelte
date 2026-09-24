<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="bridges">
	<p>
		A bridge locks or burns assets on one chain and mints or releases a representation on another.
		The asset you receive can be a claim on the original, not the original coin itself. That claim
		is only as good as the bridge contracts and the people or proofs behind them.
	</p>

	<h2>What can go wrong</h2>
	<p>
		Contract bugs can mint extra claims or trap the locked assets. A wrong or fake interface can send
		the transaction to a copy of the bridge. Wrapping means the token on the destination chain is a
		different contract from the token you started with, even when the ticker looks the same.
	</p>

	<h2>The official PulseChain bridge</h2>
	<p>
		The
		<a class="story-link" href="https://bridge.pulsechain.com/">official PulseChain bridge</a>
		moves value between Ethereum and PulseChain. Other ecosystems publish their own official bridges.
		A bridge from a random site that uses the PulseChain name is not this one. Chapter 4 explains why
		a layer 2 bridge is a different hop from this Ethereum-to-PulseChain bridge. Chapter 8 is the
		list of swap venues that stay on their own chains.
	</p>

	<h2>What Liberty Swap publishes</h2>
	<p>
		Liberty Swap describes its product as intent-based swapping and bridging. The
		<a class="story-link" href="https://docs.libertyswap.finance/">docs</a>
		and
		<a class="story-link" href="https://libertyswap.finance/">the site</a>
		advertise a zero-fee PulseChain decentralized exchange, and in-wallet swap and bridge through ZKX.
		When that flow is turned on, you move among the chains they support from ZKX, without a separate
		website. That is their published product. It is not a promise that every chain is included, and
		it is not a promise of zero fees on every route.
	</p>
</LearnArticle>
