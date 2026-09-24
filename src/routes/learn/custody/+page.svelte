<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="custody">
	<p>
		Chapter 6 names wallet software. This chapter is who holds the keys behind a balance. It is
		education, not advice. Blind Bit Boys does not store user keys, and this site will never ask you
		for a seed phrase.
	</p>

	<h2>Custodial exchange</h2>
	<p>
		On a custodial exchange, the company holds the coins. You have a login. They run the keys. A
		withdrawal is a request they can approve, delay, or freeze under their rules and the rules they
		answer to. You are trusting their security and their solvency. Until a withdrawal confirms on the
		chain you chose, the balance is an entry on that company’s books.
	</p>
	<p>
		Kraken, Coinbase, Robinhood, and Cash App, in chapter 5, are examples of companies in that role.
		X is not. A cashtag Trade button sends you to a partner. The partner still holds the coins until
		you withdraw.
	</p>

	<h2>Self-custody wallet</h2>
	<p>
		A self-custody wallet is software or hardware that holds the keys on your side. The chain only
		sees an address. Coinbase Wallet, MetaMask, Internet Money, and ZKX, in
		<a class="story-link" href="/learn/wallets">chapter 6</a>, are that kind of tool. They are not the
		exchange that shares a brand name. Assets in a Coinbase exchange account are not the same record
		as assets in Coinbase Wallet until you withdraw.
	</p>

	<h2>Address and seed</h2>
	<p>
		An address is derived from a public key. It is safe to share so someone can pay you. Publishing
		an address also lets anyone read that address on an explorer. That is public data, not a secret
		you can take back.
	</p>
	<p>
		A private key, or the seed phrase that can recreate it, proves control. Anyone who has it can
		empty the wallet. Never type it into a website, a Discord message, or a “support chat.” A real
		wallet vendor does not need the seed to help you install the software. Blind Bit Boys will not
		ask for it.
	</p>

	<h2>Not your keys, not your coins</h2>
	<p>
		“Not your keys, not your coins” means that if you do not control the private key, you have an IOU
		at that company. The company can be honest and still fail. The IOU is only as good as their
		books, their security, and their ability to pay withdrawals.
	</p>

	<h2>When a custodian fails</h2>
	<p>
		When a custodian is hacked, insolvent, or blocks withdrawals, users can lose access. This is
		history, not a how-to. In February 2014, Mt. Gox halted withdrawals and closed the exchange. On
		28 February 2014 it filed for bankruptcy protection in Japan. On 10 November 2022, FTX suspended
		withdrawals. On 11 November 2022 it filed for Chapter 11 bankruptcy protection in the United
		States. Hot-wallet thefts at various centralized venues are the same kind of history: coins the
		company was holding became coins the users could not withdraw. The lesson is counterparty risk.
		This page does not give dollar figures and does not describe how those failures were carried out.
	</p>

	<h2>Risks on your side</h2>
	<p>Self-custody moves the risks onto the key holder.</p>
	<ul>
		<li>
			A phishing site or a fake extension copies a wallet’s name and asks you to type a seed or sign
			a broad approval.
		</li>
		<li>
			A lost seed with no backup is final. The company cannot reset a key it never held.
		</li>
		<li>
			Malware can swap the address on your clipboard, so the address you paste is not the one you
			copied.
		</li>
		<li>
			A send on the wrong chain does not arrive as the same balance. The same address text can exist
			on more than one EVM chain, and the coins still live on the chain you actually used.
		</li>
	</ul>

	<h2>What to do instead</h2>
	<p>
		Use the wallet hosts on
		<a class="story-link" href="/official-links">Official Links</a>. Type the address yourself or use a
		bookmark you already trust. Write the seed on paper, offline, and store that paper where a
		website cannot see it. A hardware wallet from that vendor’s own site is optional. Send a small
		test first. Read the full address on the device you are sending from, not only the first and last
		characters. Keep the wallet software updated. None of that is a promise against loss. It is the
		ordinary care this page can describe. It is education, not advice.
	</p>
</LearnArticle>
