<script lang="ts">
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
	
    // Defineing ExpandedTopics 
    interface ExpandedTopics {
        liquidity: boolean;
        provider: boolean;
        bonding: boolean;
    }

    // defined Topic, which uses ExpandedTopics
    interface Topic {
        title: string;
        content: string[];
        key: keyof ExpandedTopics;
    }

    // Initializing variables
    let expandedTopics: ExpandedTopics = {
        liquidity: false,
        provider: false,
        bonding: false
    };

    const topics: Topic[] = [

	
        {
            title: "What is Liquidity",
content: [
    "Liquidity refers to how easily an asset can be converted into cash or traded in markets. In cryptocurrency, this measures how quickly digital assets can be bought/sold without significant price impact.",
    
    "1. High Liquidity features:",
    "   1.1. Many buyers/sellers in the market",
    "   1.2. Quick transaction execution",
    "   1.3. Minimal price fluctuations",
    "   1.4. Tight bid-ask spreads",
    
    "2. Low Liquidity characteristics:",
    "   2.1. Few market participants",
    "   2.2. Slippage in trade execution",
    "   2.3. Large price swings",
    "   2.4. Wider bid-ask spreads",

    "3. Key Liquidity Factors:",
    "   3.1. Trading Volume - Higher volumes indicate active markets with better liquidity",
    "   3.2. Order Book Depth - More buy/sell orders near current price = better liquidity",
    "   3.3. Exchange Availability - Assets listed on multiple platforms gain broader liquidity",
    "   3.4. Market Makers - Entities that provide constant buy/sell orders to facilitate trading",

    "4. Market liquidity is crucial for:",
    "   4.1. Preventing price manipulation",
    "   4.2. Ensuring fair price discovery",
    "   4.3. Reducing transaction costs",
    "   4.4. Enabling large trades without market impact",

    "5. In decentralized finance (DeFi), liquidity is particularly critical for:",
    "   5.1. Automated Market Maker (AMM) protocols",
    "   5.2. Yield farming and staking mechanisms",
    "   5.3. Maintaining stablecoin pegs",
    "   5.4. Supporting leveraged trading positions"
],
key: "liquidity"
},

	{
    title: "What is a Liquidity Provider",
    content: [
        "What is LP or Liquidity Provider?",

        "To begin explaining this, we need to look at a few terms:",

        "1. Bonding:",
        "   In cryptocurrency, \"bonding\" typically refers to the creation of liquidity pools involving pairs of tokens. This process is central to decentralized exchanges (DEXs) like Uniswap, SushiSwap, 9mm, or Pulsex.",

        "2. Liquidity Pools:",

        "   2.1. Pairing Tokens:", 
        "   A liquidity pool consists of a pair of tokens, for example, ETH and a stable coin like USDC. Users provide equal value amounts of both tokens to the pool.",

        "   2.2. Providing Liquidity:", 
        "   When you add liquidity, you're essentially bonding the two assets together in the pool. This bonding ensures that trades between these two tokens can occur seamlessly.",

        "   2.3. Automated Market Maker (AMM):", 
        "   The AMM model facilitates trading by using a mathematical formula to price assets within the pool. The most common formula is (x * y = k), where (x) and (y) are the quantities of the two tokens, and (k) is a constant.",

        "   2.4. Liquidity Provider (LP) Tokens:", 
        "   When you provide liquidity, you receive LP tokens representing your share of the pool. These tokens can be staked, traded, or used in other DeFi services.",

        "   2.5. Earnings:", 
        "   Liquidity providers earn a portion of the trading fees generated from swaps in the pool, proportional to their share of the total pool.",

        "   2.6. Impermanent Loss:", 
        "   This is a risk liquidity providers face when the price of the bonded tokens changes relative to each other. It can lead to a lower value of the bonded assets compared to holding them separately.",

        "3. Benefits of Bonding:",

        "   3.1. Price Stability:", 
        "   By bonding assets, liquidity pools help stabilize prices and reduce volatility.",

        "   3.2. Access to Trades:", 
        "   Users can trade directly against the pool without needing a counterparty.",

        "   3.3. Decentralization:", 
        "   Unlike traditional order books, liquidity pools allow for decentralized trading without intermediaries.",

        "This system of bonding through liquidity pools is fundamental to the operation of many decentralized finance (DeFi) platforms, enhancing the efficiency and accessibility of trading in the crypto space."
    ],
    key: "provider"
},
{
            title: "Calculating Liquidity Bonding",
            content: [
                "In the formula (x * y = k), used by Automated Market Makers (AMMs), (k) represents a constant that remains unchanged during trades. This constant ensures that the product of the quantities of the two tokens in a liquidity pool remains the same before and after a trade.",

                "1. Explanation:",
                "   1.1. (x) and (y): These are the quantities of the two different tokens in the liquidity pool.",
                "   1.2. (k): The constant product. It ensures that the pool's total value remains balanced, even as the amounts of (x) and (y) change due to trades.",

                // ... rest of the content ...

                "This example illustrates how the constant (k) helps stabilize trades by adjusting token quantities while preserving the pool's balance."
            ],
            key: "bonding"
        }
    ];

    const toggleContent = (topicKey: keyof ExpandedTopics): void => {
        expandedTopics = {
            ...expandedTopics,
            [topicKey]: !expandedTopics[topicKey]
        };
    };
</script>
<svelte:head>
	<title>The Blind Bit Boyz Crypto Initiative</title>
	<meta
		name="description"
		content="The Blind Bit Boyz Crypto Initiative is a website that is designed to bring accessibility to the ever expanding crypto market for users who are blind."
	/>
	<meta name="author" content="The Blind Bit Boyz" />
</svelte:head>

<section class="bg-gray-800 px-6 py-16 text-center">
	<h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">
		Liquidity and Liquidity Providing</h1>

	<p class="text-xl">
		

	</p>
</section>
<div class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 pt-20">
    <!-- Left column for topics -->
    <div class="md:w-1/2 pr-8">
        {#each topics as topic (topic.key)}
            <div class="topic mb-16">
                <h2 class="text-2xl font-bold text-yellow-500 mb-4">{topic.title}</h2>
                <button
                    on:click={() => toggleContent(topic.key)}
                    class="bg-white text-gray-800 hover:text-yellow-500 transition duration-300 mb-6 focus:outline-none font-semibold py-2 px-4 rounded shadow-md hover:shadow-lg"
                    aria-expanded={expandedTopics[topic.key]}
                >
                    {expandedTopics[topic.key] ? 'Show Less' : 'Show More'}
                </button>

                {#if expandedTopics[topic.key]}
                    <div transition:fade={{ duration: 300 }}>
                        {#each topic.content as paragraph}
                            <p class="text-gray-700 leading-relaxed mb-4">{@html paragraph}</p>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Right column for image -->
    <div class="md:w-1/2 mt-8 md:mt-0">
        <img src="waterfall.png" alt="Waterfalls" class="w-full h-auto object-cover sticky top-20" />
    </div>
</div>

<section class="bg-gray-800 px-6 py-16 text-center">
	<h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">
		Accessible Resources for Liquidity and Liquidity Providing</h1>

	<p class="text-xl">We have been working diligently with developers to make sure that their sites and tools  are accessible. As we work with them, we will share them here. </p>

	<h2 class="pt-24">The Block Hive:</h2>
	<p>The Block Hive is a site that will allow you to find any pair with the necessary  contract address. You can search for a token on every exchange in Pulse Chain. The results show up on the site or are downloadable. This site is very valuable in researching liquidity relevant to a pair, or the liquidity in all the pairs that a coin has been bonded with.</p>
	<p>To use this site, just follow the link 		<a
		class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
		href="https://liquidity-pools.vercel.app/">Block Hive</a
	>, and follow the instructions. The developer has been very willing to make sure that the site is accessible with a screen reader.</p>  

		
		
</section>