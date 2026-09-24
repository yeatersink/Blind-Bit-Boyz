<script lang="ts">
	import LearnArticle from '$lib/components/story/LearnArticle.svelte';
</script>

<LearnArticle slug="nodes">
	<p>
		With some programming and systems skill, you can run your own node. A node checks the chain on a
		machine you operate. A website such as
		<a class="story-link" href="https://scan.pulsechain.com/">scan.pulsechain.com</a>
		can show the same blocks. The website is still someone else’s server until you verify it.
	</p>
	<p>
		Blind Bit Boys is working with a few teams so non-programmers can get a node up with clearer,
		accessible steps. This page does not name an unreleased product.
	</p>

	<h2>Three ways to host it</h2>
	<ul>
		<li>
			Your own hardware. The computer stays in a place you control. Power, disk, and an open port
			are your problem. Docker and a compose file are a common way to start the clients together.
		</li>
		<li>
			A virtual private server. You rent a machine in a data center and install the same software.
			You still operate the node. The host operates the hardware.
		</li>
		<li>
			A hosted “node as a service,” when you only need an RPC: a remote server that answers chain
			questions. That is not validating. You are trusting the operator’s answer unless you also run
			a node that checks it.
		</li>
	</ul>

	<h2>Bitcoin</h2>
	<p>
		Bitcoin Core can run pruned or full. Pruned mode saves disk after the state is checked. An
		archive of every historical state is much larger.
		<a class="story-link" href="https://bitcoin.org/en/bitcoin-core/">Bitcoin Core</a>.
	</p>

	<h2>Ethereum</h2>
	<p>
		Ethereum needs an execution client and a consensus client. People run full, snap, or archive
		modes. Snap sync reaches the current state faster. Archive is huge.
		<a class="story-link" href="https://ethereum.org/en/developers/docs/nodes-and-clients/"
			>Ethereum nodes and clients</a
		>.
	</p>

	<h2>BNB Chain</h2>
	<p>
		<a class="story-link" href="https://docs.bnbchain.org/">BNB Chain docs</a> publish how to run a
		node for that chain. A BNB Chain node does not check Ethereum or PulseChain.
	</p>

	<h2>Solana</h2>
	<p>
		Solana’s current documentation for validators and RPC is at
		<a class="story-link" href="https://solana.com/docs">solana.com/docs</a>. Follow that path rather
		than an old mirror. A Solana validator is a different client from an EVM execution client.
	</p>

	<h2>PulseChain</h2>
	<p>
		Start at <a class="story-link" href="https://pulsechain.com/">pulsechain.com</a>. That site says
		running a single node requires a deposit of 32,000,000 PLS. Operators use go-pulse, plus
		Lighthouse or Prysm clients forked for PulseChain.
	</p>
	<p>
		Details on that site point to the
		<a class="story-link" href="https://launchpad.pulsechain.com/">PulseChain Launchpad</a>.
	</p>
	<p>
		They also point to the
		<a
			class="story-link"
			href="https://gitlab.com/pulsechaincom/pulsechain-mainnet#advanced-users-running-a-pulsechain-node"
			>PulseChain mainnet node notes</a
		>.
	</p>
	<p>
		Confirm the 32,000,000 PLS deposit on pulsechain.com before sending funds. Gas is extra. Validators
		can receive rewards and can be slashed. Running one is optional and operationally heavy. It is not
		a shortcut to profit.
	</p>
</LearnArticle>
