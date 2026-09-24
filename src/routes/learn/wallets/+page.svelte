<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="wallets">
	<p>
		A wallet here is software, or a hardware device, that holds keys and shows the addresses those
		keys control. This site will never ask you for a seed phrase.
		<a class="story-link" href="/learn/custody">Chapter 7, who holds the keys</a>, is the difference
		between an exchange login and that wallet.
	</p>

	<h2>Coinbase Wallet</h2>
	<p>
		<a class="story-link" href="https://wallet.coinbase.com/">Coinbase Wallet</a> is the self-custody
		wallet. It is separate from the Coinbase exchange in chapter 5. Assets in the exchange
		account are not the same record as assets in Coinbase Wallet until you withdraw.
	</p>

	<h2>MetaMask</h2>
	<p>
		<a class="story-link" href="https://metamask.io/">MetaMask</a> is a self-custody wallet used across
		EVM chains. Adding BNB Chain, a layer 2, or PulseChain is a network setting in the wallet. The
		same address can exist on each of those chains, and the balances are still per chain.
	</p>

	<h2>Internet Money</h2>
	<p>
		<a class="story-link" href="https://internetmoney.io/">Internet Money</a> describes its wallet as
		non-custodial and open source, for Bitcoin, Ethereum, and EVM chains, and says it collects no
		data.
	</p>

	<h2>ZKX Wallet</h2>
	<p>
		ZKX Wallet comes from Liberty Swap. It is a self-custodial browser extension, and a web app that
		can be installed as a progressive web app (PWA). It supports PulseChain and other EVM chains. It
		includes Railgun public and private modes, and it can swap and bridge inside the wallet.
	</p>
	<p>
		Blind Bit Boys works with that team so ZKX can be used with JAWS or NVDA. That work is
		underway. This page does not claim the wallet is already perfect.
	</p>
	<ul>
		<li>
			<a class="story-link" href="https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet"
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
</LearnArticle>
