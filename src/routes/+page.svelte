<script lang="ts">
	import { onMount } from 'svelte';

	const chapters = [
		{ id: 'chapter-01', label: 'Chapter 1', title: 'Bitcoin and the idea of a chain' },
		{ id: 'chapter-02', label: 'Chapter 2', title: 'Ethereum and DeFi' },
		{ id: 'chapter-03', label: 'Chapter 3', title: 'Other chains, PulseChain, and the law today' },
		{ id: 'chapter-04', label: 'Chapter 4', title: 'How to buy on centralized venues' },
		{ id: 'chapter-05', label: 'Chapter 5', title: 'Wallets, including ZKX' },
		{ id: 'chapter-06', label: 'Chapter 6', title: 'Yield, farms, validators — not only trading' },
		{ id: 'chapter-07', label: 'Chapter 7', title: 'Bridges' },
		{ id: 'chapter-08', label: 'Chapter 8', title: 'Read the public record' },
		{ id: 'chapter-09', label: 'Chapter 9', title: 'Run your own node' },
		{ id: 'chapter-10', label: 'Chapter 10', title: 'Blind Bit Boys' }
	] as const;

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
		content="Ten chapters from the Bitcoin white paper to wallets, bridges, and nodes that a screen reader can use. Education, not financial advice."
	/>
</svelte:head>

<div class="flex flex-grow flex-col bg-black text-gray-100 lg:flex-row">
	<nav class="story-nav" aria-label="On this page">
		<p class="text-gold-400 px-4 pt-4 text-xs font-semibold tracking-[0.18em] uppercase lg:px-5">
			On this page
		</p>
		<ul class="flex flex-wrap gap-1 px-2 py-3 lg:flex-col lg:flex-nowrap lg:px-3">
			{#each chapters as chapter (chapter.id)}
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
				Ten chapters, from the Bitcoin white paper to the wallets, exchanges, bridges, and nodes a
				screen reader has to be able to use. One beat at a time. No autoplaying video, and no looping
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
				<span class="title">Bitcoin and the idea of a chain</span>
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
					is the design document.
				</p>
			</div>
		</section>

		<section id="chapter-03" class="story-chapter" aria-labelledby="chapter-03-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">03</p>
				<p class="year-mark">2023</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-03-title">
				<span class="kicker">Chapter 3.</span>
				<span class="title">Other chains, PulseChain, and the law today</span>
			</h2>
			<div class="prose">
				<p>
					<a class="story-link" href="https://solana.com/">Solana</a> is built for high throughput. It
					uses a different consensus design from Ethereum, and it makes different tradeoffs.
				</p>
				<p>
					<a class="story-link" href="https://pulsechain.com/">PulseChain</a> is an Ethereum-style chain.
					It launched in May 2023, with cheaper fees, the coin PLS, and
					<a class="story-link" href="https://pulsex.com/">PulseX</a> as the main decentralized exchange.
					For the tools this site tests and teaches, PulseChain is home. It is not the only real chain.
				</p>
				<div class="year-row year-row-inline">
					<p class="year-mark">2025</p>
					<span class="chapter-rule" aria-hidden="true"></span>
				</div>
				<p>
					As of September 2026, the United States is building market-structure rules. Those rules are
					not finished.
				</p>
				<p>
					The GENIUS Act is US law. It was signed on 18 July 2025. The statute’s name is the Guiding
					and Establishing National Innovation for U.S. Stablecoins Act. It is a federal framework for
					payment stablecoins. Implementing rules were not finished by the one-year mark. The
					statute’s fallback timing runs toward 18 January 2027. The GENIUS Act did not make all
					crypto legal.
					<a
						class="story-link"
						href="https://www.congress.gov/bill/119th-congress/senate-bill/1582/text"
						>GENIUS Act bill text on Congress.gov</a
					>.
				</p>
				<p>
					The CLARITY Act, the Digital Asset Market Clarity Act, passed the House in July 2025. Senate
					cloture failed on 15 September 2026. It is not enacted.
				</p>
				<p>
					Elsewhere, the European Union’s Markets in Crypto-Assets regulation, MiCA, is the large
					existing regime. Many countries license exchanges.
				</p>
				<p>
					The public actors in this chapter are Congress, the Treasury, the Securities and Exchange
					Commission (SEC), and the Commodity Futures Trading Commission (CFTC).
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
				<span class="title">How to buy on centralized venues</span>
			</h2>
			<div class="prose">
				<p>
					<a class="story-link" href="https://www.kraken.com/">Kraken</a>,
					<a class="story-link" href="https://www.coinbase.com/">Coinbase</a>, and
					<a class="story-link" href="https://robinhood.com/">Robinhood</a> are centralized venues. The
					usual path is to create an account, complete identity checks (often called KYC), buy
					bitcoin, ether, or another asset they list, and withdraw to a wallet you control when you
					are ready.
				</p>
				<p>
					Cash App offers Bitcoin for many US users. The company’s own page is the
					<a class="story-link" href="https://cash.app/help/us/en-us/3113-bitcoin-faq"
						>Cash App Bitcoin help</a
					>.
				</p>
				<p>
					On X, as of September 2026, X Money is a fiat payments product, in beta for premium users in
					the United States. A cashtag such as $BTC can show a chart and a Trade button. That button
					sends you to partners, including Coinbase, Kraken, and Gemini. X is not a crypto exchange,
					and X does not custody those trades.
					<a class="story-link" href="https://x.com/">X</a>.
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
				<span class="title">Wallets, including ZKX</span>
			</h2>
			<div class="prose">
				<p>
					A balance on an exchange is an entry on that company’s books. A self-custody wallet holds
					keys you control. This site will never ask you for a seed phrase.
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
					wallet. Blind Bit Boys works with that team so ZKX can be used with a screen reader. That
					work is underway. This page does not claim the wallet is already perfect.
				</p>
				<ul>
					<li>
						<a
							class="story-link"
							href="https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet"
							>What is ZKX Wallet</a
						>
					</li>
					<li>
						<a class="story-link" href="https://libertyswap.finance/">Liberty Swap</a>
					</li>
					<li>
						<a
							class="story-link"
							href="https://chromewebstore.google.com/detail/zkx-web3-wallet/fibfaangghabdbndamiaceoahiajfgck"
							>ZKX Web3 Wallet on the Chrome Web Store</a
						>, offered by LibertySwap Developer
					</li>
				</ul>
			</div>
		</section>

		<section id="chapter-06" class="story-chapter" aria-labelledby="chapter-06-title">
			<div class="year-row">
				<p class="giant" aria-hidden="true">06</p>
				<span class="chapter-rule" aria-hidden="true"></span>
			</div>
			<h2 id="chapter-06-title">
				<span class="kicker">Chapter 6.</span>
				<span class="title">Yield, farms, validators — not only trading</span>
			</h2>
			<div class="prose">
				<p>
					Trading is one use of a chain. Yield is the word people use when assets are put to work for
					a payment. A payment can fail to arrive.
				</p>
				<ul>
					<li>
						Staking means locking coins to help run a network, in exchange for rewards the protocol
						may pay.
					</li>
					<li>Lending interest means supplying assets to a pool that borrowers pay to use.</li>
					<li>
						Liquidity-provider fees, or LP fees, mean depositing a pair of tokens into a pool and
						taking a share of trading fees. Impermanent loss is the gap that can open between holding
						those tokens in the pool and simply holding them in your wallet.
					</li>
					<li>
						Restaking, where a protocol offers it, means staking an asset that is already pledged
						somewhere else. Another layer adds another way to lose funds.
					</li>
				</ul>
				<p>
					The risks have plain names: impermanent loss, smart-contract bugs, slashing (a network
					taking part of a stake when rules are broken), and scams.
				</p>
				<p>
					Blind Bit Boys treats
					<a class="story-link" href="https://libertyswap.finance/">Liberty Swap</a>
					and
					<a class="story-link" href="https://app.pulsex.com/">PulseX</a>
					as the live apps we test and teach for screen-reader use.
				</p>
				<p>
					A PulseChain validator locks PLS, commonly described as 32 million PLS plus gas, and runs an
					execution client and a consensus client. Validators can receive rewards and can be slashed.
					Running one is optional, and it is operationally heavy.
					<a class="story-link" href="https://launchpad.pulsechain.com/">The PulseChain Launchpad</a>,
					linked from pulsechain.com, describes itself as the place to register validators. Introductions
					also live on a community hub,
					<a class="story-link" href="https://www.gopulsechain.com/validators"
						>GoPulseChain validators</a
					>, and on <a class="story-link" href="https://pulsechain.com/">pulsechain.com</a>.
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
				<span class="title">Bridges</span>
			</h2>
			<div class="prose">
				<p>
					A bridge locks or burns assets on one chain and mints or releases a representation on
					another. The risks are contract bugs, a wrong or fake interface, and wrapping: the token you
					receive can be a claim on the original, not the original coin itself.
				</p>
				<p>
					The
					<a class="story-link" href="https://bridge.pulsechain.com/">official PulseChain bridge</a>
					moves value between Ethereum and PulseChain. Other ecosystems publish their own official bridges.
				</p>
				<p>
					Liberty Swap describes its product as intent-based swapping and bridging. The
					<a class="story-link" href="https://docs.libertyswap.finance/">docs</a>
					and
					<a class="story-link" href="https://libertyswap.finance/">the site</a>
					advertise a zero-fee PulseChain decentralized exchange, and in-wallet swap and bridge through
					ZKX. When that flow is turned on, you move among the chains they support from ZKX, without a
					separate website. That is their published product. It is not a promise that every chain is
					included, and it is not a promise of zero fees on every route.
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
				<span class="title">Read the public record</span>
			</h2>
			<div class="prose">
				<p>
					<a class="story-link" href="https://scan.pulsechain.com/">scan.pulsechain.com</a>
					describes itself as where to scan PulseChain, and pulsechain.com links to it. Scanning is how
					you read the public record after a transfer, a swap, or a bridge: the blocks and transactions
					a network has already accepted.
				</p>
				<p>
					The scanner is still a website in front of a node. The next chapter is how to check that
					record on a machine you run.
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
				<span class="title">Run your own node</span>
			</h2>
			<div class="prose">
				<p>Anyone can run infrastructure. Pruned mode saves disk. An archive of everything is huge.</p>
				<ul>
					<li>
						Bitcoin Core can run pruned or full.
						<a class="story-link" href="https://bitcoin.org/en/bitcoin-core/">Bitcoin Core</a>.
					</li>
					<li>
						Ethereum uses an execution client and a consensus client. People run full, snap, or
						archive nodes.
						<a
							class="story-link"
							href="https://ethereum.org/en/developers/docs/nodes-and-clients/"
							>Ethereum nodes and clients</a
						>.
					</li>
					<li>
						PulseChain’s mainnet repository on GitLab is linked from pulsechain.com, including its
						notes on running a node. Operators use go-pulse, plus Lighthouse or Prysm clients forked
						for PulseChain.
						<a
							class="story-link"
							href="https://gitlab.com/pulsechaincom/pulsechain-mainnet#advanced-users-running-a-pulsechain-node"
							>PulseChain mainnet node notes</a
						>.
					</li>
					<li>
						BNB Chain publishes public node documentation, as do other networks.
						<a class="story-link" href="https://docs.bnbchain.org/">BNB Chain docs</a>.
					</li>
				</ul>
				<p>
					Running a node is how you verify the chain without trusting a remote server, often called an
					RPC, to tell you the truth.
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
				<span class="title">Blind Bit Boys</span>
			</h2>
			<div class="prose">
				<p>
					This site exists so blind and low-vision people can search, read token facts, and hear
					charts. Token and pair pages use Highcharts sonification for that sound. This homepage does
					not load those charts, and it does not play sound.
				</p>
				<p>
					Inclusive crypto is wallets, decentralized exchanges, bridges, and nodes that work with
					JAWS, plus teaching that does not assume a mouse.
				</p>
				<ul class="cta-row">
					<li><a class="story-cta" href="/search">Search tokens</a></li>
					<li>
						<a class="story-cta story-cta-secondary" href="#chapter-01"
							>Read the story from Bitcoin</a
						>
					</li>
					<li>
						<a class="story-cta story-cta-secondary" href="https://libertyswap.finance/"
							>Liberty Swap</a
						>
					</li>
					<li>
						<a class="story-cta story-cta-secondary" href="https://app.pulsex.com/">PulseX</a>
					</li>
				</ul>
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
