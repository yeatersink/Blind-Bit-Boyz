<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="yield">
	<p>
		A swap pays the pool. Providing liquidity is how a person becomes part of that pool. A farm is
		often a second contract that pays an extra token for staying deposited. None of this is a rate
		you should expect to keep.
	</p>

	<h2>Liquidity on an Uniswap-style pool</h2>
	<p>
		On an EVM chain, the common pool holds two tokens. You deposit both, in the proportion the pool
		asks for, and you receive a claim on a share of the trading fees. The same shape shows up on
		Ethereum, BNB Chain, Polygon, PulseChain, and other EVM networks. The contract addresses are not
		the same just because the tickers match.
		<a class="story-link" href="https://docs.uniswap.org/">Uniswap docs</a>
		describe the pattern. The docs address currently stays on uniswap.org.
	</p>
	<p>
		Where a Solana protocol offers a farm, it is the same idea on Solana’s programs: deposit, receive
		a share of fees or an extra token, and accept the risks below. Not every Solana token has a farm.
	</p>

	<h2>Impermanent loss</h2>
	<p>
		Impermanent loss is the gap between holding the two tokens in the pool and simply holding them in
		a wallet. If one token’s price moves far from the other, the pool rebalances by selling the one
		that rose and holding more of the one that fell. Fees can offset that gap. They do not have to.
		The name “impermanent” is hopeful. If you withdraw after the move, the gap is permanent.
	</p>

	<h2>Contract risk and fake sites</h2>
	<p>
		The pool is a program. A bug, an upgrade key, or a function that lets the deployer withdraw the
		reserves can empty it. Chapter 3 names those failure modes. A fake site copies the exchange name
		and asks for an approval. Bookmark
		<a class="story-link" href="https://app.pulsex.com/">the PulseX app</a>
		and
		<a class="story-link" href="https://app.uniswap.org/">the Uniswap app</a>
		rather than following a search result.
	</p>

	<h2>Where this project spends its time</h2>
	<p>
		At this point Blind Bit Boys finds PulseChain the most practical chain for screen-reader DeFi,
		using
		<a class="story-link" href="https://app.pulsex.com/">PulseX</a>
		and
		<a class="story-link" href="https://libertyswap.finance/">Liberty Swap Finance</a>.
		That is a judgment about this project’s work. It is not a claim that any one exchange is the only
		one a screen reader can operate.
	</p>
</LearnArticle>
