<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="dex">
	<p>
		A centralized exchange holds the coins in its account. A decentralized exchange swaps inside a
		wallet. The swap is a call to a smart contract. The coins move from your address to the pool,
		and the pool sends the other token back, if the transaction succeeds.
	</p>

	<h2>The wallet has to be on the right network</h2>
	<p>
		A PulseX pool does not see an Ethereum balance. A Uniswap pool does not see a BNB Chain balance.
		Before you approve anything, the wallet’s network must be the chain where that pool lives.
		Adding the network is a setting in the wallet. The same address can exist on several chains, and
		the balances are still separate.
	</p>

	<h2>Approve, then swap</h2>
	<ol>
		<li>
			Approve. You send a transaction that lets the exchange contract move up to a set amount of
			the token you are selling. Approval is its own transaction and its own fee. It does not yet
			swap.
		</li>
		<li>
			Swap. You send a second transaction. The contract takes the sold token and sends the bought
			token according to the pool’s price, minus the pool’s fee. If you set a minimum you will
			accept and the price has moved past it, the swap can revert. You still paid the fee for the
			attempt.
		</li>
	</ol>

	<h2>AMM and aggregator</h2>
	<p>
		An automated market maker, or AMM, is a pool of two tokens. The Uniswap v2 pattern prices a
		trade from the two reserves. PulseX, PancakeSwap, QuickSwap, Raydium, and Sushi are in this
		family, each on the chains they actually deploy.
	</p>
	<p>
		An aggregator does not have to be the pool. Jupiter, on Solana, searches other venues and builds
		a route. You still sign in your wallet. The route can touch more than one program. Read the
		route before you confirm it.
	</p>

	<h2>Official hosts</h2>
	<p>Bookmark these. A search ad and a similar name are how fake swap sites spread.</p>
	<ul>
		<li>
			Ethereum:
			<a class="story-link" href="https://uniswap.org/">Uniswap</a>
			and the
			<a class="story-link" href="https://app.uniswap.org/">Uniswap app</a>.
		</li>
		<li>
			PulseChain:
			<a class="story-link" href="https://pulsex.com/">PulseX</a>
			and the
			<a class="story-link" href="https://app.pulsex.com/">PulseX app</a>.
		</li>
		<li>
			BNB Chain: <a class="story-link" href="https://pancakeswap.finance/">PancakeSwap</a>.
		</li>
		<li>Solana aggregator: <a class="story-link" href="https://jup.ag/">Jupiter</a>.</li>
		<li>Solana pools: <a class="story-link" href="https://raydium.io/">Raydium</a>.</li>
		<li>Polygon: <a class="story-link" href="https://quickswap.exchange/">QuickSwap</a>.</li>
		<li>
			Several EVM chains: <a class="story-link" href="https://www.sushi.com/">Sushi</a>.
		</li>
	</ul>
	<p>
		On Avalanche,
		<a class="story-link" href="https://traderjoexyz.com/">Trader Joe</a>
		is the familiar venue. That address currently redirects to lfj.gg.
	</p>

	<h2>Phishing</h2>
	<p>
		A lookalike uses a close name, a copied logo, and a page that asks you to approve a contract.
		That approval can let the contract move your tokens. This site will never ask for a seed phrase.
		Type the host yourself, or use a bookmark you created from the links above. Do not trust a
		domain that is one letter off, or a “PulseX” site that is not pulsex.com or app.pulsex.com.
	</p>

	<h2>The path this project tests</h2>
	<p>
		PulseX and
		<a class="story-link" href="https://libertyswap.finance/">Liberty Swap</a>
		are this project’s accessible swap path. The other venues on this page are real exchanges. They
		are listed so you can tell an official host from a copy. This page does not claim they are
		certified for JAWS or NVDA.
	</p>
</LearnArticle>
