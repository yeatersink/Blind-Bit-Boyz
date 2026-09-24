<script lang="ts">
	const external = {
		target: '_blank',
		rel: 'noopener noreferrer'
	};
</script>

<svelte:head>
	<title>Official Links — Blind Bit Boys</title>
	<meta
		name="description"
		content="Verified public sites for Blind Bit Boys. Bookmark these. Blind Bit Boys does not host these services."
	/>
</svelte:head>

<div class="learn-shell">
	<h1>Official Links</h1>
	<p>Verified public sites. Bookmark these. Blind Bit Boys does not host these services.</p>
	<p>Avoid names that are one letter off. Those are not the hosts below.</p>

	<h2>Blind Bit Boys</h2>
	<ul>
		<li><a class="story-link" href="/search">Token search</a></li>
		<li><a class="story-link" href="/learn">Learn index</a></li>
		<li><a class="story-link" href="/tools">Accessible tools</a></li>
		<li>
			<a class="story-link" href="/tools/price-watch">Blind Banker Price Watch Bot (WIP)</a>
		</li>
		<li><a class="story-link" href="/instructions">Instructions</a></li>
	</ul>

	<h2>Bitcoin and Ethereum</h2>
	<ul>
		<li>{@render out('https://bitcoin.org/bitcoin.pdf', 'Bitcoin white paper (PDF)')}</li>
		<li>{@render out('https://bitcoin.org/', 'Bitcoin')}</li>
		<li>{@render out('https://ethereum.org/', 'Ethereum')}</li>
		<li>{@render out('https://ethereum.org/whitepaper/', 'Ethereum white paper')}</li>
		<li>{@render out('https://ethereum.org/en/smart-contracts/', 'Ethereum smart contracts')}</li>
		<li>{@render out('https://ethereum.org/en/layer-2/', 'Ethereum layer 2 explainer')}</li>
	</ul>

	<h2>Other chains</h2>
	<ul>
		<li>{@render out('https://solana.com/', 'Solana')}</li>
		<li>{@render out('https://www.bnbchain.org/', 'BNB Chain')}</li>
		<li>{@render out('https://docs.bnbchain.org/', 'BNB Chain docs')}</li>
		<li>{@render out('https://pulsechain.com/', 'PulseChain')}</li>
		<li>{@render out('https://scan.pulsechain.com/', 'scan.pulsechain.com')}</li>
	</ul>

	<h2>Explorers</h2>
	<ul>
		<li>{@render out('https://blockstream.info/', 'Blockstream (Bitcoin)')}</li>
		<li>{@render out('https://etherscan.io/', 'Etherscan')}</li>
		<li>{@render out('https://otterscan.io/', 'Otterscan')}</li>
		<li>{@render out('https://eth.blockscout.com/', 'Blockscout for Ethereum')}</li>
		<li>{@render out('https://scan.pulsechain.com/', 'scan.pulsechain.com')}</li>
		<li>
			{@render out('https://ipfs.scan.pulsechain.com/', 'ipfs.scan.pulsechain.com')}
			(pulsechain.com lists this host as its block explorer URL)
		</li>
		<li>{@render out('https://bscscan.com/', 'BscScan')}</li>
		<li>{@render out('https://explorer.solana.com/', 'Solana Explorer')}</li>
		<li>{@render out('https://solscan.io/', 'Solscan')}</li>
		<li>{@render out('https://polygonscan.com/', 'PolygonScan')}</li>
		<li>{@render out('https://snowtrace.io/', 'Snowtrace')}</li>
		<li>{@render out('https://arbiscan.io/', 'Arbiscan')}</li>
		<li>{@render out('https://basescan.org/', 'BaseScan')}</li>
		<li><a class="story-link" href="/learn/explorers">Block explorers</a></li>
	</ul>

	<h2>Centralized places to buy</h2>
	<ul>
		<li>{@render out('https://www.kraken.com/', 'Kraken')}</li>
		<li>{@render out('https://www.coinbase.com/', 'Coinbase')}</li>
		<li>{@render out('https://robinhood.com/', 'Robinhood')}</li>
		<li>{@render out('https://cash.app/', 'Cash App')}</li>
		<li>{@render out('https://x.com/', 'X')}</li>
	</ul>

	<h2>Wallets</h2>
	<ul>
		<li>{@render out('https://wallet.coinbase.com/', 'Coinbase Wallet')}</li>
		<li>{@render out('https://metamask.io/', 'MetaMask')}</li>
		<li>{@render out('https://internetmoney.io/', 'Internet Money')}</li>
		<li>
			{@render out(
				'https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet',
				'ZKX Wallet docs'
			)}
		</li>
		<li>
			{@render out(
				'https://chromewebstore.google.com/detail/zkx-web3-wallet/fibfaangghabdbndamiaceoahiajfgck',
				'ZKX Web3 Wallet (Chrome Web Store)'
			)}
		</li>
	</ul>

	<h2>Custody</h2>
	<ul>
		<li><a class="story-link" href="/learn/custody">Who holds the keys</a></li>
	</ul>
	<p>Wallet hosts for self-custody are in the Wallets group.</p>

	<h2>On-chain swaps (DEXes)</h2>
	<ul>
		<li>{@render out('https://uniswap.org/', 'Uniswap')}</li>
		<li>{@render out('https://app.uniswap.org/', 'Uniswap app')}</li>
		<li>{@render out('https://pulsex.com/', 'PulseX')}</li>
		<li>{@render out('https://app.pulsex.com/', 'PulseX app')}</li>
		<li>{@render out('https://pancakeswap.finance/', 'PancakeSwap')}</li>
	</ul>
	<h3>Solana DEXes</h3>
	<ul>
		<li>{@render out('https://jup.ag/', 'Jupiter')}</li>
		<li>{@render out('https://raydium.io/', 'Raydium')}</li>
	</ul>
	<h3>More swap venues</h3>
	<ul>
		<li>{@render out('https://quickswap.exchange/', 'QuickSwap')}</li>
		<li>
			{@render out('https://traderjoexyz.com/', 'Trader Joe')}
			(this address currently redirects to lfj.gg)
		</li>
		<li>{@render out('https://www.sushi.com/', 'Sushi')}</li>
		<li>{@render out('https://docs.uniswap.org/', 'Uniswap docs')}</li>
	</ul>

	<h2>Bridges and PulseChain DeFi</h2>
	<ul>
		<li>{@render out('https://bridge.pulsechain.com/', 'PulseChain bridge')}</li>
		<li>{@render out('https://libertyswap.finance/', 'Liberty Swap')}</li>
		<li>{@render out('https://docs.libertyswap.finance/', 'Liberty Swap docs')}</li>
	</ul>

	<h2>Privacy</h2>
	<ul>
		<li><a class="story-link" href="/learn/privacy">Privacy on public chains</a></li>
		<li>{@render out('https://railgun.org/', 'Railgun')}</li>
		<li>
			{@render out(
				'https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet',
				'ZKX Wallet docs'
			)}
		</li>
	</ul>

	<h2>Run a node</h2>
	<ul>
		<li>{@render out('https://bitcoin.org/en/bitcoin-core/', 'Bitcoin Core')}</li>
		<li>
			{@render out(
				'https://ethereum.org/en/developers/docs/nodes-and-clients/',
				'Ethereum nodes and clients'
			)}
		</li>
		<li>{@render out('https://solana.com/docs', 'Solana docs')}</li>
		<li>{@render out('https://launchpad.pulsechain.com/', 'PulseChain Launchpad')}</li>
		<li>
			{@render out(
				'https://gitlab.com/pulsechaincom/pulsechain-mainnet#advanced-users-running-a-pulsechain-node',
				'PulseChain mainnet node notes'
			)}
		</li>
	</ul>

	<h2>US law</h2>
	<ul>
		<li>
			{@render out(
				'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text',
				'GENIUS Act bill text (Congress.gov)'
			)}
		</li>
	</ul>

	<h2>Social media links to follow</h2>
	<ul>
		<li>{@render out('https://x.com/yeatersink', 'X (Blind Bit Boys)')}</li>
		<li>{@render out('https://x.com/LibertySwapFi', 'X (Liberty Swap)')}</li>
		<li>{@render out('https://x.com/zkxwallet', 'X (ZKX Wallet)')}</li>
		<li>{@render out('https://github.com/yeatersink', 'GitHub')}</li>
	</ul>
</div>

{#snippet out(href: string, label: string)}
	<a class="story-link" {href} {...external}>
		{label}
		<span class="sr-only">(opens in a new tab)</span>
	</a>
{/snippet}
