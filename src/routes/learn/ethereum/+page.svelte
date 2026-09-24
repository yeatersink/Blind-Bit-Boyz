<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="ethereum">
	<p>
		In 2015, Ethereum added a general-purpose virtual machine. Bitcoin’s ledger mostly records
		payments. Ethereum’s ledger can also store programs and run them when someone sends a
		transaction.
	</p>
	<h2>The virtual machine</h2>
	<p>
		Those programs are smart contracts. Tokens are one thing a contract can track. The network, not
		a private server, is the source of truth for what the code did.
		<a class="story-link" href="/learn/smart-contracts">Smart contracts</a> walks the ladder from a
		plain token to exchanges, loans, and bridges.
	</p>
	<h2>DeFi</h2>
	<p>
		Tokens and smart contracts let a market run without one company operating the exchange. An
		automated market maker, or AMM, is a pool of tokens that prices a trade from a formula. Lending
		markets pool assets and charge borrowers. Stablecoins are tokens that aim to hold a steady
		value, often one dollar.
	</p>
	<p>
		DeFi is that layer: markets made of contracts instead of a single exchange operator. Fees and
		complexity are the honest downside. A crowded chain can cost a lot to use, and a contract does
		what it was written to do, including the mistakes.
	</p>
	<h2>The documents</h2>
	<p>
		<a class="story-link" href="https://ethereum.org/">Ethereum</a> publishes the network overview.
		<a class="story-link" href="https://ethereum.org/whitepaper/">The Ethereum white paper</a>
		is the design document.
	</p>
</LearnArticle>
