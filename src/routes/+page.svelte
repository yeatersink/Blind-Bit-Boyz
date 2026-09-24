<script lang="ts">
	import { onMount } from 'svelte';
	import { storyChapters } from '$lib/story/chapters';

	let current = $state('');

	onMount(() => {
		const nodes = document.querySelectorAll<HTMLElement>('main#story section[id]');
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
				if (visible?.target.id) current = visible.target.id;
			},
			{ rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] }
		);
		nodes.forEach((node) => observer.observe(node));
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Blind Bit Boys</title>
	<meta
		name="description"
		content="Fifteen chapters from the Bitcoin white paper to wallets, custody, swaps, bridges, explorers, and privacy that a screen reader can use. Education, not financial advice."
	/>
</svelte:head>

<div class="flex flex-grow flex-col bg-black text-gray-100 lg:flex-row">
	<nav class="story-nav" aria-label="On this page">
		<p class="text-gold-400 px-4 pt-4 text-xs font-semibold tracking-[0.18em] uppercase lg:px-5">
			On this page
		</p>
		<ul class="flex flex-wrap gap-1 px-2 py-3 lg:flex-col lg:flex-nowrap lg:px-3">
			{#each storyChapters as chapter (chapter.id)}
				<li>
					<a
						href="#{chapter.id}"
						aria-current={current === chapter.id ? 'location' : undefined}
					>
						<span class="text-gold-400 block text-xs font-semibold tracking-[0.14em] uppercase">
							{chapter.label}
						</span>
						<span class="chapter-nav-title">{chapter.title}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<main id="story" tabindex="-1">
		<header class="story-hero">
			<div class="year-row">
				<p class="year-mark">2008–2026</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h1>Blind Bit Boys</h1>
			<p class="lede">
				Fifteen chapters, from the Bitcoin white paper to wallets, custody, swaps, bridges, explorers,
				and privacy a screen reader has to be able to use. One beat at a time. No autoplaying video, and no looping
				sound.
			</p>
			<p class="mt-10">
				<a class="story-cta" href="#chapter-01">Start with Chapter 1</a>
			</p>
		</header>

		<section id="chapter-01" class="story-chapter" aria-labelledby="chapter-01-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">01</p>
				<p class="year-mark">2008</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-01-title">
				<span class="kicker">Chapter 1.</span>
				<span class="title">Bitcoin and the chain</span>
			</h2>
			<div class="prose">
				<p>
					In 2008 and 2009, Satoshi Nakamoto published
					<a class="story-link" href="https://bitcoin.org/bitcoin.pdf"
						>Bitcoin: A Peer-to-Peer Electronic Cash System (PDF)</a
					>. The paper describes sending value online without a bank clearing the payment. Satoshi
					Nakamoto is the name on that paper.
				</p>
				<p>
					A blockchain is a shared ledger. Transactions are grouped into blocks. Each block is linked
					to the one before it by a hash. The network agrees on that chain of blocks.
				</p>
				<p>
					On Bitcoin, a buy or a sell is a transfer of unspent transaction outputs, called UTXOs. The
					transfer is broadcast. Miners can include it in a block. It is settled as more blocks are
					added after that one.
				</p>
				<p>
					The project site is <a class="story-link" href="https://bitcoin.org/">Bitcoin.org</a>.
				</p>
				<p>
					<a class="story-link" href="/learn/bitcoin"
						>Read more: Bitcoin and the chain on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-02" class="story-chapter" aria-labelledby="chapter-02-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">02</p>
				<p class="year-mark">2015</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-02-title">
				<span class="kicker">Chapter 2.</span>
				<span class="title">Ethereum and DeFi</span>
			</h2>
			<div class="prose">
				<p>
					In 2015, Ethereum added a general-purpose virtual machine. Programs on that machine are
					called smart contracts. Tokens are one thing those contracts can track.
				</p>
				<p>
					Tokens and smart contracts let a market run without one company operating the exchange. An
					automated market maker, or AMM, is a pool of tokens that prices a trade from a formula.
					Lending markets pool assets and charge borrowers. Stablecoins are tokens that aim to hold a
					steady value, often one dollar.
				</p>
				<p>
					DeFi is that layer: markets made of contracts instead of a single exchange operator. Fees
					and complexity are the honest downside. A crowded chain can cost a lot to use, and a
					contract does what it was written to do, including the mistakes.
				</p>
				<p>
					<a class="story-link" href="https://ethereum.org/">Ethereum</a>
					publishes the network overview.
					<a class="story-link" href="https://ethereum.org/whitepaper/">The Ethereum white paper</a>
					is the design document. The next chapter is the ladder of programs those contracts can be.
				</p>
				<p>
					<a class="story-link" href="/learn/ethereum"
						>Read more: Ethereum and DeFi on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-03" class="story-chapter" aria-labelledby="chapter-03-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">03</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-03-title">
				<span class="kicker">Chapter 3.</span>
				<span class="title">Smart contracts</span>
			</h2>
			<div class="prose">
				<p>
					A smart contract is a program stored on a chain. You send a transaction, and the network
					runs that code the same way for everyone. No private server is the source of truth.
				</p>
				<p>
					Gas, the fee, pays validators to run the code. Bugs are public, and a mistake is often
					irreversible.
				</p>
				<p>
					The programs climb a ladder. A minimal token (ERC-20, or PRC-20 on PulseChain) stores a
					name, a symbol, balances, and transfer. A stablecoin, or a token in the HEX or PLS style,
					is still that balance contract plus extra rules. An NFT (ERC-721) uses unique ids, so one
					is not a substitute for another. A multisig or simple vault asks several keys to sign.
				</p>
				<p>
					An automated market maker holds two tokens and prices a trade with x times y equals k, the
					Uniswap v2 pattern. PulseX is that family on PulseChain. Lending contracts take collateral,
					charge interest, and liquidate if the price falls. Aave and Compound are Ethereum-style
					examples. Stablecoin issuer contracts mint and redeem against reserves or against other
					crypto. Bridges and intent routers lock, mint, or settle a swap across chains. Chapter 9 is
					that subject, including Liberty Swap. Staking and validator deposits are contracts too, on
					Ethereum and on PulseChain. Chapter 11 is where a node and a validator stake are described.
				</p>
				<p>
					<a class="story-link" href="/learn/smart-contracts"
						>Read more: Smart contracts on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-04" class="story-chapter" aria-labelledby="chapter-04-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">04</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-04-title">
				<span class="kicker">Chapter 4.</span>
				<span class="title">Other blockchains, layer 2s, and PulseChain</span>
			</h2>
			<div class="prose">
				<p>
					<a class="story-link" href="https://solana.com/">Solana</a> is built for high throughput. Its
					runtime is different from the EVM, and the tradeoffs are different from Ethereum’s.
				</p>
				<p>
					<a class="story-link" href="https://www.bnbchain.org/">BNB Chain</a>, also called BNB Smart
					Chain, is an EVM-compatible chain associated with the Binance ecosystem. Fees are often
					lower than on Ethereum layer 1, and MetaMask-style wallets can use it for tokens, decentralized
					exchanges, and as a destination for bridges. It has its own validators and its own risks. It
					is not Binance the exchange.
					<a class="story-link" href="https://docs.bnbchain.org/">BNB Chain docs</a> describe the network.
				</p>
				<p>
					Layer 2s on Ethereum post data to Ethereum and execute more cheaply off layer 1.
					Optimistic-style rollups include Arbitrum and Optimism. Base is an OP-stack chain. ZK-style
					examples include zkSync, Scroll, and Linea.
					<a class="story-link" href="https://ethereum.org/en/layer-2/">Ethereum’s layer 2 explainer</a>
					is the official overview. To use one, the wallet needs that layer 2, you need a bridge or an
					official on-ramp, and a token can keep the same name while living in a different contract
					until it is bridged.
				</p>
				<div class="year-row year-row-inline">
					<p class="year-mark">2023</p>
					<span class="chapter-rule" aria-hidden="true"></span>
				</div>
				<p>
					<a class="story-link" href="https://pulsechain.com/">PulseChain</a> is an Ethereum-style chain.
					It launched in May 2023, with cheaper fees and the coin PLS.
				</p>
				<p>
					<a class="story-link" href="https://pulsex.com/">PulseX</a> is the main decentralized exchange.
				</p>
				<p>
					<a class="story-link" href="https://bridge.pulsechain.com/">The official bridge</a>
					moves assets from Ethereum.
				</p>
				<p>
					<a class="story-link" href="https://scan.pulsechain.com/">scan.pulsechain.com</a>
					is where to scan PulseChain. PulseChain is home for the tools this site tests. Solana, BNB
					Chain, Ethereum, and the layer 2s above are networks in the same story.
				</p>
				<p>
					<a class="story-link" href="/learn/chains"
						>Read more: Other blockchains, layer 2s, and PulseChain on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-05" class="story-chapter" aria-labelledby="chapter-05-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">05</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-05-title">
				<span class="kicker">Chapter 5.</span>
				<span class="title">How to buy on centralized exchanges</span>
			</h2>
			<div class="prose">
				<p>
					<a class="story-link" href="https://www.kraken.com/">Kraken</a> is a centralized exchange.
				</p>
				<p>
					<a class="story-link" href="https://www.coinbase.com/">Coinbase</a> is a centralized exchange.
				</p>
				<p>
					<a class="story-link" href="https://robinhood.com/">Robinhood</a> is a centralized exchange.
				</p>
				<p>
					The usual path is to create an account, complete identity checks (often called KYC), buy
					bitcoin, ether, or another asset they list, and withdraw to a wallet you control when you
					are ready.
				</p>
				<p>
					<a class="story-link" href="https://cash.app/">Cash App</a> offers Bitcoin for many US users.
				</p>
				<p>
					On X, as of September 2026, X Money is a fiat payments product, in beta for premium users in
					the United States. A cashtag such as $BTC can show a chart and a Trade button. That button
					sends you to partners, including Coinbase, Kraken, and Gemini. X is not a crypto exchange,
					and X does not custody those trades.
					<a class="story-link" href="https://x.com/">X</a>.
				</p>
				<p>
					<a class="story-link" href="/learn/buy-crypto"
						>Read more: How to buy on centralized exchanges on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-06" class="story-chapter" aria-labelledby="chapter-06-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">06</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-06-title">
				<span class="kicker">Chapter 6.</span>
				<span class="title">Wallets</span>
			</h2>
			<div class="prose">
				<p>
					A wallet here is software, or a hardware device, that holds keys and shows the addresses
					those keys control. This site will never ask you for a seed phrase. Who holds the keys, the
					company or you, is chapter 7.
				</p>
				<p>
					<a class="story-link" href="https://wallet.coinbase.com/">Coinbase Wallet</a> is the
					self-custody wallet. It is separate from the Coinbase exchange.
					<a class="story-link" href="https://metamask.io/">MetaMask</a> is another self-custody wallet.
				</p>
				<p>
					<a class="story-link" href="https://internetmoney.io/">Internet Money</a> describes its wallet
					as non-custodial and open source, for Bitcoin, Ethereum, and EVM chains, and says it
					collects no data.
				</p>
				<p>
					ZKX Wallet comes from Liberty Swap. It is a self-custodial browser extension, and a web app
					that can be installed as a progressive web app (PWA). It supports PulseChain and other EVM
					chains. It includes Railgun public and private modes, and it can swap and bridge inside the
					wallet. Blind Bit Boys works with that team so ZKX can be used with JAWS or NVDA. That
					work is underway. This page does not claim the wallet is already perfect.
				</p>
				<p>
					<a
						class="story-link"
						href="https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet"
						>What is ZKX Wallet</a
					>
					is the Liberty Swap page for that product.
				</p>
				<p>
					The extension is listed as
					<a
						class="story-link"
						href="https://chromewebstore.google.com/detail/zkx-web3-wallet/fibfaangghabdbndamiaceoahiajfgck"
						>ZKX Web3 Wallet on the Chrome Web Store</a
					>, offered by LibertySwap Developer.
				</p>
				<p>
					<a class="story-link" href="/learn/wallets">Read more: Wallets on Blind Bit Boys</a>
				</p>
			</div>
		</section>

		<section id="chapter-07" class="story-chapter" aria-labelledby="chapter-07-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">07</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-07-title">
				<span class="kicker">Chapter 7.</span>
				<span class="title">Who holds the keys</span>
			</h2>
			<div class="prose">
				<p>
					On a custodial exchange, the company holds the coins. You have a login. They run the keys.
					They can freeze a withdrawal. You are trusting their security and their solvency.
				</p>
				<p>
					A self-custody wallet is software or hardware that holds the keys on your side. The chain only
					sees an address. The wallets in chapter 6 are that kind of tool.
				</p>
				<p>
					An address, derived from a public key, is safe to share so someone can pay you. A private key
					or a seed phrase proves control. Anyone who has it can empty the wallet. Never type it into a
					website, a Discord message, or a “support chat.”
				</p>
				<p>
					“Not your keys, not your coins” means that if you do not control the private key, you have an
					IOU at that company. When a custodian is hacked, insolvent, or blocks withdrawals, users can
					lose access. In February 2014, Mt. Gox halted withdrawals and closed the exchange. On 28
					February 2014 it filed for bankruptcy protection in Japan. On 10 November 2022, FTX suspended
					withdrawals. On 11 November 2022 it filed for Chapter 11 bankruptcy protection in the United
					States. Hot-wallet thefts at various centralized venues are the same kind of history. The
					lesson is counterparty risk.
				</p>
				<p>
					Self-custody has its own risks: a phishing site or a fake extension, a lost seed with no
					backup, malware that swaps the address on your clipboard, and a send on the wrong chain. Use
					the wallet hosts on
					<a class="story-link" href="/official-links">Official Links</a>. Write the seed on paper,
					offline. A hardware wallet from that vendor’s own site is optional. Send a small test first.
					Read the address back. Keep the software updated. Blind Bit Boys does not store user keys. This
					is education, not advice.
				</p>
				<p>
					<a class="story-link" href="/learn/custody"
						>Read more: Who holds the keys on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-08" class="story-chapter" aria-labelledby="chapter-08-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">08</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-08-title">
				<span class="kicker">Chapter 8.</span>
				<span class="title">Swap on the chain itself</span>
			</h2>
			<div class="prose">
				<p>
					A centralized exchange, in chapter 5, holds the coins for you. A decentralized exchange
					swaps inside a wallet through smart contracts. The wallet has to be on the same network as
					the pool. These are the official hosts. This page does not link lookalike domains.
				</p>
				<p>
					On Ethereum,
					<a class="story-link" href="https://uniswap.org/">Uniswap</a>
					is the venue.
				</p>
				<p>
					The
					<a class="story-link" href="https://app.uniswap.org/">Uniswap app</a>
					is the same project. uniswap.org currently opens the app, still on uniswap.org.
				</p>
				<p>
					On PulseChain,
					<a class="story-link" href="https://pulsex.com/">PulseX</a>
					is the venue.
				</p>
				<p>
					The
					<a class="story-link" href="https://app.pulsex.com/">PulseX app</a>
					is the trading site.
				</p>
				<p>
					On BNB Chain,
					<a class="story-link" href="https://pancakeswap.finance/">PancakeSwap</a> is the venue.
				</p>
				<p>
					On Solana,
					<a class="story-link" href="https://jup.ag/">Jupiter</a> is an aggregator: it searches other
					pools and builds a route. It is not itself the only pool.
				</p>
				<p>
					Also on Solana,
					<a class="story-link" href="https://raydium.io/">Raydium</a> is a venue with its own pools.
				</p>
				<p>
					On Polygon,
					<a class="story-link" href="https://quickswap.exchange/">QuickSwap</a> is the venue.
				</p>
				<p>
					On Avalanche,
					<a class="story-link" href="https://traderjoexyz.com/">Trader Joe</a>
					is the familiar venue. That address currently redirects to lfj.gg.
				</p>
				<p>
					Across several EVM chains,
					<a class="story-link" href="https://www.sushi.com/">Sushi</a> is a venue.
				</p>
				<p>
					PulseX and Liberty Swap are this project’s accessible swap path. The other exchanges above
					are real venues. This page does not claim they are certified for JAWS or NVDA.
				</p>
				<p>
					<a class="story-link" href="/learn/dex"
						>Read more: Swap on the chain itself on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-09" class="story-chapter" aria-labelledby="chapter-09-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">09</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-09-title">
				<span class="kicker">Chapter 9.</span>
				<span class="title">Bridges</span>
			</h2>
			<div class="prose">
				<p>
					A bridge locks or burns assets on one chain and mints or releases a representation on
					another. The risks are a wrong site and contract bugs. The token you receive can be a claim
					on the original, not the original coin itself.
				</p>
				<p>
					The
					<a class="story-link" href="https://bridge.pulsechain.com/">official PulseChain bridge</a>
					moves value between Ethereum and PulseChain.
				</p>
				<p>
					<a class="story-link" href="https://libertyswap.finance/">Liberty Swap</a>
					describes in-wallet swap and bridge through ZKX.
				</p>
				<p>
					Its
					<a class="story-link" href="https://docs.libertyswap.finance/">docs</a>
					describe that published product. It is not a promise of every chain, and it is not a promise
					that every route is free.
				</p>
				<p>
					<a class="story-link" href="/learn/bridges">Read more: Bridges on Blind Bit Boys</a>
				</p>
			</div>
		</section>

		<section id="chapter-10" class="story-chapter" aria-labelledby="chapter-10-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">10</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-10-title">
				<span class="kicker">Chapter 10.</span>
				<span class="title">Yield, farming, providing liquidity</span>
			</h2>
			<div class="prose">
				<p>
					Providing liquidity means depositing a pair of tokens into an automated-market-maker pool,
					the Uniswap-style pool that runs on EVM chains. You receive a share of the trading fees.
					A farm pays an extra token on top of that deposit. Solana has farms where a protocol offers
					them. A payment can fail to arrive.
				</p>
				<p>
					Impermanent loss is the gap between holding the tokens in the pool and simply holding them
					in a wallet. Contract bugs can drain a pool. A fake site can imitate the real exchange.
				</p>
				<p>
					At this point Blind Bit Boys finds PulseChain the most practical chain for screen-reader
					DeFi, using
					<a class="story-link" href="https://app.pulsex.com/">PulseX</a>.
					<a class="story-link" href="https://libertyswap.finance/">Liberty Swap Finance</a>
					is the other part of that path. That is a judgment about this project’s work.
					<a class="story-link" href="https://docs.uniswap.org/">Uniswap docs</a>
					explain the pool pattern those EVM exchanges share.
				</p>
				<p>
					<a class="story-link" href="/learn/yield"
						>Read more: Yield, farming, providing liquidity on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-11" class="story-chapter" aria-labelledby="chapter-11-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">11</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-11-title">
				<span class="kicker">Chapter 11.</span>
				<span class="title">Running your own node</span>
			</h2>
			<div class="prose">
				<p>
					With some programming and systems skill, you can run your own node. Pruned mode saves disk.
					An archive of everything is huge. People run one on their own hardware, often with Docker
					and a compose file, or on a rented server. A hosted “node as a service” can give you an
					RPC. That is not the same as validating.
				</p>
				<p>
					Bitcoin, pruned or full, uses
					<a class="story-link" href="https://bitcoin.org/en/bitcoin-core/">Bitcoin Core</a>.
				</p>
				<p>
					Ethereum needs an execution client and a consensus client.
					<a
						class="story-link"
						href="https://ethereum.org/en/developers/docs/nodes-and-clients/"
						>Ethereum nodes and clients</a
					>
					is the overview.
				</p>
				<p>
					BNB Chain publishes its steps in the
					<a class="story-link" href="https://docs.bnbchain.org/">BNB Chain docs</a>.
				</p>
				<p>
					Solana validator and RPC notes are in the
					<a class="story-link" href="https://solana.com/docs">Solana docs</a>.
				</p>
				<p>
					PulseChain uses go-pulse plus Lighthouse or Prysm clients forked for the chain. Start at
					<a class="story-link" href="https://pulsechain.com/">pulsechain.com</a>.
					That site says running a single node requires a deposit of 32,000,000 PLS.
				</p>
				<p>
					That page links the
					<a class="story-link" href="https://launchpad.pulsechain.com/">PulseChain Launchpad</a>
					for how to run a node.
				</p>
				<p>
					It also links the
					<a
						class="story-link"
						href="https://gitlab.com/pulsechaincom/pulsechain-mainnet#advanced-users-running-a-pulsechain-node"
						>mainnet node notes</a
					>.
				</p>
				<p>
					Confirm the 32,000,000 PLS deposit on pulsechain.com before sending funds. Gas is extra.
					Running a validator is optional and operationally heavy. Blind Bit Boys is working with a
					few teams so non-programmers can get a node up with clearer, accessible steps. This page
					does not name an unreleased product, and it does not promise an easy fortune.
				</p>
				<p>
					<a class="story-link" href="/learn/nodes"
						>Read more: Running your own node on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-12" class="story-chapter" aria-labelledby="chapter-12-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">12</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-12-title">
				<span class="kicker">Chapter 12.</span>
				<span class="title">Block explorers</span>
			</h2>
			<div class="prose">
				<p>
					A block explorer is a search engine for one chain. You look up an address, a transaction
					hash, a token, or a block. The page shows sender, receiver, amount, fee, and status. It reads
					public data, often from a node. It does not move funds.
				</p>
				<p>
					Behind the page is an indexer and a site, sitting on RPC or node data. Two explorers can read
					the same chain and still disagree on labels. The chain is the record. Check that you are on the
					real domain before you paste an address.
				</p>
				<p>
					Those fields are text. JAWS or NVDA can read them when the explorer page exposes that text.
					This page does not certify those sites.
				</p>
				<ul>
					<li>
						Bitcoin:
						<a class="story-link" href="https://blockstream.info/">Blockstream</a>
					</li>
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
						<a class="story-link" href="https://ipfs.scan.pulsechain.com/">ipfs.scan.pulsechain.com</a>.
						pulsechain.com lists that second host as its block explorer URL.
					</li>
					<li>
						BNB Chain: <a class="story-link" href="https://bscscan.com/">BscScan</a>
					</li>
					<li>
						Solana:
						<a class="story-link" href="https://explorer.solana.com/">Solana Explorer</a>
						and
						<a class="story-link" href="https://solscan.io/">Solscan</a>
					</li>
					<li>
						Polygon: <a class="story-link" href="https://polygonscan.com/">PolygonScan</a>
					</li>
					<li>
						Avalanche C-Chain: <a class="story-link" href="https://snowtrace.io/">Snowtrace</a>
					</li>
					<li>
						Arbitrum: <a class="story-link" href="https://arbiscan.io/">Arbiscan</a>
					</li>
					<li>
						Base: <a class="story-link" href="https://basescan.org/">BaseScan</a>
					</li>
				</ul>
				<p>
					mempool.space did not open when this page was checked, so it is not linked. pulsechain.com and
					scan.pulsechain.com do not link an Otterscan host, so this page does not add one. What that
					public record means for privacy is chapter 13.
				</p>
				<p>
					<a class="story-link" href="/learn/explorers"
						>Read more: Block explorers on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-13" class="story-chapter" aria-labelledby="chapter-13-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">13</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-13-title">
				<span class="kicker">Chapter 13.</span>
				<span class="title">Privacy on public chains</span>
			</h2>
			<div class="prose">
				<p>
					Most popular chains are transparent. Anyone with a block explorer can follow an address.
					“Pseudonymous” means the chain shows an address, not a legal name. It does not mean the
					activity is private.
				</p>
				<p>
					On Bitcoin, Ethereum, PulseChain, BNB Chain, and Solana, a normal transfer is public. Sender,
					receiver, and amount can be read by anyone who looks.
				</p>
				<p>
					Mixers and shady “privacy apps” carry high legal risk and high scam risk. This page does not
					recommend them, does not describe how to use them, and does not suggest breaking the law.
				</p>
				<p>
					<a class="story-link" href="https://railgun.org/">Railgun</a> is a privacy system for EVM-style
					chains. Users can shield a balance into a private pool, transfer inside that pool, and later
					unshield back to a public address. That is the shape of the system. This page does not walk
					the steps.
				</p>
				<p>
					ZKX Wallet, from Liberty Swap, integrates Railgun so Public Mode and Private Mode live in the
					same self-custodial wallet. The product page is
					<a class="story-link" href="https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet"
						>What is ZKX Wallet</a
					>. Blind Bit Boys works with that team on accessibility of those modes for people who use JAWS
					or NVDA. That work is underway. Private mode is not a claim that every observer is blind to the
					activity, and it is not a claim that the mode is legal in every country. Users have to follow
					the law where they live.
				</p>
				<p>
					<a class="story-link" href="/learn/privacy"
						>Read more: Privacy on public chains on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-14" class="story-chapter" aria-labelledby="chapter-14-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">14</p>
				<p class="year-mark">2025</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-14-title">
				<span class="kicker">Chapter 14.</span>
				<span class="title">Law and public policy</span>
			</h2>
			<div class="prose">
				<p>
					As of September 2026, the United States is building market-structure rules. Those rules are
					not finished.
				</p>
				<p>
					The GENIUS Act is US law for payment stablecoins. It was signed on 18 July 2025. The rules
					are still rolling in. They were not finished at the one-year mark, and the statute’s
					fallback timing runs toward 18 January 2027. It does not legalize all crypto.
					<a
						class="story-link"
						href="https://www.congress.gov/bill/119th-congress/senate-bill/1582/text"
						>GENIUS Act bill text on Congress.gov</a
					>.
				</p>
				<p>
					The CLARITY Act passed the House in July 2025. Senate cloture failed on 15 September 2026.
					It is not law.
				</p>
				<p>
					The public actors here are Congress, the Treasury, the Securities and Exchange Commission
					(SEC), and the Commodity Futures Trading Commission (CFTC). The European Union’s Markets in
					Crypto-Assets regulation, MiCA, is the large regime outside the United States.
				</p>
				<p>
					<a class="story-link" href="/learn/policy"
						>Read more: Law and public policy on Blind Bit Boys</a
					>
				</p>
			</div>
		</section>

		<section id="chapter-15" class="story-chapter" aria-labelledby="chapter-15-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">15</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-15-title">
				<span class="kicker">Chapter 15.</span>
				<span class="title">Blind Bit Boys</span>
			</h2>
			<div class="prose">
				<p>
					This site is educational. It is not a broker, not an exchange, and not financial advice.
					Nothing here is an offer to buy or sell any asset.
				</p>
				<p>Blind Bit Boys exists to:</p>
				<ul>
					<li>Draw awareness to crypto.</li>
					<li>
						Push accessibility and inclusivity, including people who use screen readers such as JAWS and NVDA.
					</li>
					<li>
						Introduce helpful tools so blind and low-vision users can inspect tokens and hear market
						data.
					</li>
				</ul>
				<p>
					<a class="story-link" href="/search">Token search</a> and the token overview that follows
					are how you look up a token or a pair on this site. From a token or a pair, the Technical
					Analysis tab opens the Highcharts suite: sonification, indicators, and export. This
					homepage does not load those charts, and it does not play sound. More of what we point
					people toward is on
					<a class="story-link" href="/tools">Accessible tools</a>.
				</p>
				<p>
					An upcoming Token Price Watcher is planned to send Telegram messages with a token’s price
					and whether that price is up, down, or flat. It is not finished.
					<a class="story-link" href="/tools/price-watch">Blind Banker Price Watch Bot</a>
					is work in progress.
				</p>
				<ul class="cta-row">
					<li><a class="story-cta" href="/search">Search tokens</a></li>
					<li><a class="story-cta story-cta-secondary" href="/tools">Accessible tools</a></li>
					<li>
						<a class="story-cta story-cta-secondary" href="/tools/price-watch"
							>Blind Banker Price Watch Bot</a
						>
					</li>
				</ul>
				<p>The price watch link is work in progress. The bot is not live.</p>
				<p>Education and inclusion come first. Do your own research. We do not manage funds.</p>
				<p>
					<a class="story-link" href="/learn/about">Read more: Blind Bit Boys on Blind Bit Boys</a>
				</p>
			</div>
		</section>
	</main>
</div>

<style>
	.story-nav {
		position: sticky;
		top: 8.25rem;
		z-index: 40;
		align-self: start;
		width: 100%;
		background: #000;
		border-bottom: 1px solid rgb(212 175 55 / 0.45);
	}

	.chapter-nav-title {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.story-nav a {
		position: relative;
		display: block;
		border-left: 3px solid transparent;
		padding: 0.45rem 0.75rem;
		text-decoration: none;
	}

	.story-nav a:hover {
		border-left-color: #e6c35c;
	}

	.story-nav a:focus-visible {
		outline: 2px solid #e6c35c;
		outline-offset: 2px;
	}

	.story-nav a[aria-current='location'] {
		border-left-color: #d4af37;
		font-weight: 700;
		background: rgb(212 175 55 / 0.08);
	}

	.story-hero,
	.story-chapter {
		position: relative;
		min-height: 100dvh;
		padding: 4.5rem 1.5rem 5rem;
		scroll-margin-top: 18rem;
	}

	.story-hero {
		display: flex;
		max-width: 46rem;
		flex-direction: column;
		justify-content: center;
		margin-inline: auto;
	}

	h1 {
		margin-top: 1.25rem;
		font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
		font-size: clamp(3.25rem, 8vw, 6.5rem);
		line-height: 0.95;
		letter-spacing: -0.03em;
		color: #f0d78c;
	}

	.lede {
		margin-top: 1.5rem;
		max-width: 40rem;
		font-size: 1.25rem;
		line-height: 1.6;
		color: #e5e7eb;
	}

	.story-chapter {
		border-top: 1px solid rgb(212 175 55 / 0.35);
	}

	.giant {
		margin: 0;
		flex-shrink: 0;
		font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
		font-size: clamp(2.4rem, 5vw, 3.5rem);
		line-height: 1;
		color: rgb(212 175 55 / 0.55);
		user-select: none;
	}

	.year-row {
		display: flex;
		max-width: 46rem;
		align-items: center;
		gap: 1rem;
		margin-inline: auto;
		margin-bottom: 1.25rem;
	}

	.year-row-inline {
		margin-top: 2rem;
		margin-bottom: 0.5rem;
	}

	.year-mark {
		margin: 0;
		flex-shrink: 0;
		font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
		font-size: 1.75rem;
		font-weight: 700;
		color: #e6c35c;
	}

	.story-hero .year-row {
		width: 100%;
		margin-inline: 0;
	}

	h2 {
		max-width: 46rem;
		margin-inline: auto;
	}

	.kicker {
		display: block;
		font-family: 'Segoe UI', system-ui, sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #e6c35c;
	}

	.title {
		display: block;
		margin-top: 0.6rem;
		font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, serif;
		font-size: clamp(2.1rem, 5vw, 3.5rem);
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: #f5f5f4;
	}

	.prose {
		max-width: 46rem;
		margin-inline: auto;
		margin-top: 1.75rem;
	}

	.prose p,
	.prose li {
		font-size: 1.125rem;
		line-height: 1.7;
		color: #e5e7eb;
	}

	.prose p + p,
	.prose ul,
	.prose p + ul,
	.prose ul + p {
		margin-top: 1.15rem;
	}

	.prose ul {
		padding-left: 1.25rem;
		list-style: disc;
	}

	.prose li + li {
		margin-top: 0.65rem;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding-left: 0;
		list-style: none;
	}

	@media (min-width: 1024px) {
		.story-nav {
			width: 18rem;
			max-height: calc(100dvh - 8.5rem);
			overflow: auto;
			border-right: 1px solid rgb(212 175 55 / 0.45);
			border-bottom: 0;
		}

		.chapter-nav-title {
			position: static;
			display: block;
			width: auto;
			height: auto;
			margin: 0.15rem 0 0;
			overflow: visible;
			clip: auto;
			font-size: 0.875rem;
			line-height: 1.35;
			white-space: normal;
			color: #f5f5f4;
		}

		.story-hero,
		.story-chapter {
			padding-inline: 3rem;
			scroll-margin-top: 8.5rem;
		}
	}
</style>
