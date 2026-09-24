<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="smart-contracts">
	<p>
		A smart contract is a program stored on a chain. A person sends a transaction. Every node that
		follows the rules runs that code the same way. No private server is the source of truth. Gas, the
		fee, pays validators to run the code. Bugs are public, and a mistake is often irreversible.
	</p>
	<p>
		<a class="story-link" href="https://ethereum.org/en/smart-contracts/">Ethereum’s smart contract guide</a>
		is the plain-language overview. The rungs below go from a balance sheet to a bridge.
	</p>

	<h2>1. Minimal token (ERC-20 / PRC-20)</h2>
	<p>
		A minimal token contract stores a name, a symbol, and a balance for each address. Transfer moves
		a balance from one address to another. ERC-20 is the common Ethereum pattern.
		<a class="story-link" href="https://ethereum.org/en/developers/docs/standards/tokens/erc-20/"
			>The ERC-20 standard</a
		>
		describes it. PRC-20 is the same idea on PulseChain. A stablecoin, or a token in the HEX or PLS
		style, is still that balance contract plus extra rules. The extra rules do not make the balance
		magic.
	</p>

	<h2>2. NFT (ERC-721)</h2>
	<p>
		An ERC-721 contract tracks unique ids. Token number 10 is not a substitute for token number 11,
		even when the collection shares a name. You transfer an id, not a pile of interchangeable units.
	</p>

	<h2>3. Multisig / simple vault</h2>
	<p>
		A simple vault holds assets and pays them out only when enough keys sign. A two-of-three vault
		needs two of the three holders. One lost key does not have to empty the vault. One stolen key
		does not have to either, if the threshold is higher than one.
	</p>

	<h2>4. AMM DEX</h2>
	<p>
		An automated market maker holds a pool of two tokens. The Uniswap v2 pattern prices a trade from
		x times y equals k: the two reserves, multiplied, stay near a constant. A larger trade moves the
		price more. PulseX is this family on PulseChain.
		<a class="story-link" href="https://app.pulsex.com/">The PulseX app</a> is one place that pool is used.
	</p>

	<h2>5. Lending and borrowing</h2>
	<p>
		A lending contract lets someone deposit one asset and borrow another. Aave and Compound are
		Ethereum-style examples.
		<a class="story-link" href="https://aave.com/">Aave</a> is one of those projects. This page does not
		claim either system is safe.
	</p>
	<p>
		Collateral is the asset you lock so the protocol can sell it if the loan is no longer covered. It
		is the lender’s security, not a gift.
	</p>
	<p>
		Interest is the payment borrowers make for the time they hold the loan. People who supplied the
		pool may receive a share. The rate can change with demand, and a displayed rate is not a promise.
	</p>
	<p>
		Liquidation is the sale of collateral when its price falls too far, or when the debt grows past
		the protocol’s limit. The borrower can lose the locked asset. A fast price move can trigger that
		sale before a person reacts.
	</p>

	<h2>6. Stablecoin issuer contracts</h2>
	<p>
		A stablecoin issuer contract mints a token that aims to stay near a set value, often one dollar,
		and redeems it under its own rules. A USDC-style issuer mints against off-chain reserves such as
		cash and short-term government debt, and a company stands behind the redeem window. A DAI-style
		issuer mints against crypto locked in contracts, and liquidation protects the peg when collateral
		prices fall. Both are still contracts plus the rules around them. Neither sentence is a claim that
		the peg will hold.
	</p>

	<h2>7. Bridges and intent routers</h2>
	<p>
		Some contracts lock or burn an asset on one chain and mint or release a representation on
		another. An intent router takes a signed request (“I want this asset on that chain”) and settles
		it if the terms match. Chapter 9 is that subject, including the official PulseChain bridge and
		what
		<a class="story-link" href="https://libertyswap.finance/">Liberty Swap</a> publishes about swaps and
		bridges.
	</p>

	<h2>8. Staking / validator deposit</h2>
	<p>
		Ethereum and PulseChain use deposit contracts so a validator can lock the stake the protocol
		requires. The contract records the deposit. It does not run the validator’s computers. Rewards
		and slashing live in the protocol rules. Chapter 10 covers liquidity and farms. Chapter 11 covers running a node and the PulseChain validator
		role.
	</p>

	<h2>A swap, one step at a time</h2>
	<p>This is the shape of a typical pool swap. It is not a button-by-button guide for one website.</p>
	<ol>
		<li>
			Approve. You send a transaction that lets the exchange contract move up to a set amount of
			token A from your address. Approval is its own transaction, with its own fee. It does not yet
			move the tokens.
		</li>
		<li>
			Swap. You send a second transaction that calls the pool. The contract takes token A and sends
			token B according to the pool’s formula, minus the fee the pool charges. You can usually set a
			minimum amount of token B you will accept. If the price has moved past that minimum, the
			transaction reverts and you keep token A, but you still paid the fee for the attempt.
		</li>
		<li>
			New balances. Your address holds less A and more B. The pool holds more A and less B. Anyone
			can read those balances on the chain after the block is accepted.
		</li>
	</ol>

	<h2>Risks</h2>
	<p>
		A rug is a drain that the code allows. If the deployer can pull the pool, mint unlimited tokens,
		or redirect fees, the contract can be emptied while it still “works as written.”
	</p>
	<p>
		Upgrade keys mean an admin can replace the code later. A contract that looked limited on Monday
		can follow new rules on Friday. A frozen contract has no such key. Many popular contracts do.
	</p>
	<p>
		Oracle failure means a price feed the contract trusts is wrong, late, or captured. Lending
		markets and some stablecoins liquidate or mint from that price. A bad price can sell collateral
		that a calm market would have left alone.
	</p>
	<p>
		Phishing sites copy a name and a logo and ask you to sign. The signature can grant a contract
		permission to move your tokens. Blind Bit Boys will never ask for a seed phrase. Check the
		address you typed, and prefer the official links on this site.
	</p>
</LearnArticle>
