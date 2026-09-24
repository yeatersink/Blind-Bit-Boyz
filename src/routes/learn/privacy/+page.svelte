<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="privacy">
	<p>
		Most popular chains are transparent. Anyone with a block explorer can follow an address.
		“Pseudonymous” means the chain shows an address, not a legal name. It does not mean the activity
		is private. Chapter 12 is how to read that public record.
	</p>

	<h2>Pseudonymous is not private</h2>
	<p>
		An address can be used without printing a legal name on the chain. The transfers are still a
		public list. If an address is tied to an exchange account, a public post, or a payment someone
		knows about, the rest of that address’s history can be read by anyone with an explorer.
	</p>

	<h2>Default transfers are public</h2>
	<p>
		On Bitcoin, Ethereum, PulseChain, BNB Chain, and Solana, a normal transfer is public. Sender,
		receiver, and amount can be read by anyone who looks. A new address is not a privacy system. It
		is another public address.
	</p>

	<h2>Mixers</h2>
	<p>
		Mixers and shady “privacy apps” carry high legal risk and high scam risk. This page does not
		recommend them. It does not describe how to use them. It does not suggest hiding proceeds or
		breaking the law. A site that asks for a seed phrase and promises privacy is a theft, not a
		tool.
	</p>

	<h2>Railgun</h2>
	<p>
		<a class="story-link" href="https://railgun.org/">Railgun</a> is a privacy system for EVM-style
		chains. At a high level, users can shield a balance into a private pool, transfer inside that
		pool, and later unshield back to a public address. Shielded activity is the point of the pool.
		Unshielding returns value to a public address, which an explorer can see again. This page does
		not walk those steps, and it does not claim the pool hides a person from every observer.
	</p>

	<h2>Public mode and private mode</h2>
	<p>
		ZKX Wallet, from Liberty Swap, integrates Railgun so Public Mode and Private Mode live in the
		same self-custodial wallet. The wallet itself is
		<a class="story-link" href="/learn/wallets">chapter 6</a>. The product page is
		<a class="story-link" href="https://docs.libertyswap.finance/zkx-wallet/what-is-zkx-wallet"
			>What is ZKX Wallet</a
		>.
	</p>
	<p>
		Blind Bit Boys works with that team on accessibility of those modes for people who use JAWS or
		NVDA. That work is underway. This page does not claim the wallet is already perfect. Private mode
		is not a claim that every observer is blind to the activity, and it is not a claim that the mode
		is legal in every country. Users have to follow the law where they live.
	</p>
	<p>
		The same links are on
		<a class="story-link" href="/official-links">Official Links</a>. This page is education, not
		advice, and not a promise about what any investigator, exchange, or court can see.
	</p>
</LearnArticle>
