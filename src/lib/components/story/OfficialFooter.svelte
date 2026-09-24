<script lang="ts">
	const groups: { name: string; links: { href: string; label: string }[] }[] = [
		{
			name: 'Bitcoin and Ethereum',
			links: [
				{ href: 'https://bitcoin.org/bitcoin.pdf', label: 'Bitcoin white paper (PDF)' },
				{ href: 'https://bitcoin.org/', label: 'Bitcoin' },
				{ href: 'https://bitcoin.org/en/bitcoin-core/', label: 'Bitcoin Core' },
				{ href: 'https://ethereum.org/', label: 'Ethereum' },
				{ href: 'https://ethereum.org/whitepaper/', label: 'Ethereum white paper' },
				{
					href: 'https://ethereum.org/en/developers/docs/nodes-and-clients/',
					label: 'Ethereum nodes and clients'
				}
			]
		},
		{
			name: 'PulseChain, Solana, and BNB Chain',
			links: [
				{ href: 'https://solana.com/', label: 'Solana' },
				{ href: 'https://pulsechain.com/', label: 'PulseChain' },
				{ href: 'https://pulsex.com/', label: 'PulseX' },
				{ href: 'https://app.pulsex.com/', label: 'PulseX app' },
				{ href: 'https://bridge.pulsechain.com/', label: 'PulseChain bridge' },
				{ href: 'https://scan.pulsechain.com/', label: 'scan.pulsechain.com' },
				{ href: 'https://launchpad.pulsechain.com/', label: 'PulseChain Launchpad' },
				{
					href: 'https://www.gopulsechain.com/validators',
					label: 'PulseChain validator introductions (community hub)'
				},
				{
					href: 'https://gitlab.com/pulsechaincom/pulsechain-mainnet#advanced-users-running-a-pulsechain-node',
					label: 'PulseChain mainnet node notes (GitLab)'
				},
				{ href: 'https://docs.bnbchain.org/', label: 'BNB Chain docs' }
			]
		},
		{
			name: 'Wallets and venues',
			links: [
				{ href: 'https://www.coinbase.com/', label: 'Coinbase' },
				{ href: 'https://wallet.coinbase.com/', label: 'Coinbase Wallet' },
				{ href: 'https://www.kraken.com/', label: 'Kraken' },
				{ href: 'https://robinhood.com/', label: 'Robinhood' },
				{
					href: 'https://cash.app/help/us/en-us/3113-bitcoin-faq',
					label: 'Cash App Bitcoin help'
				},
				{ href: 'https://x.com/', label: 'X' },
				{ href: 'https://metamask.io/', label: 'MetaMask' },
				{ href: 'https://internetmoney.io/', label: 'Internet Money' },
				{ href: 'https://libertyswap.finance/', label: 'Liberty Swap' },
				{ href: 'https://docs.libertyswap.finance/', label: 'Liberty Swap docs' },
				{
					href: 'https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet',
					label: 'What is ZKX Wallet'
				},
				{
					href: 'https://chromewebstore.google.com/detail/zkx-web3-wallet/fibfaangghabdbndamiaceoahiajfgck',
					label: 'ZKX Web3 Wallet (Chrome Web Store)'
				}
			]
		},
		{
			name: 'US law',
			links: [
				{
					href: 'https://www.congress.gov/bill/119th-congress/senate-bill/1582/text',
					label: 'GENIUS Act bill text (Congress.gov)'
				}
			]
		}
	];
</script>

<footer class="border-gold-500 border-t bg-black py-12 text-gray-200">
	<div class="mx-auto max-w-5xl px-6">
		<p>
			<a class="story-cta" href="/search">Search</a>
		</p>
		<p class="mt-6 max-w-3xl text-base leading-relaxed text-gray-200">
			Not financial advice. This story is education. It is not a recommendation to buy, sell, bridge,
			stake, or run a validator, and it is not a promise about price or yield. Contracts can fail, and
			laws can change.
		</p>
		<p class="mt-8">
			<a class="story-link" href="#story">Back to story</a>
		</p>
		<nav class="mt-10" aria-label="Official links">
			{#each groups as group (group.name)}
				<p class="text-gold-400 mt-8 text-sm font-semibold tracking-[0.16em] uppercase">
					{group.name}
				</p>
				<ul class="mt-3 grid gap-2 sm:grid-cols-2">
					{#each group.links as link (link.href)}
						<li>
							<a class="story-link" href={link.href}>{link.label}</a>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</div>
</footer>
