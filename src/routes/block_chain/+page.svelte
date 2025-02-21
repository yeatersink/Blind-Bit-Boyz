<script lang="ts">
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
      

// Video Element 
let videoElement: HTMLVideoElement;
let isPlaying: boolean = false;

function togglePlay(): void {
  if (videoElement) {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
}

function fastForward(): void {
  if (videoElement) {
    videoElement.currentTime += 10; // Fast forward 10 seconds
  }
}

function rewind(): void {
  if (videoElement) {
    videoElement.currentTime -= 10; // Rewind 10 seconds
  }
}

onMount(() => {
  if (videoElement) {
    videoElement.addEventListener('play', () => {
      isPlaying = true;
    });

    videoElement.addEventListener('pause', () => {
      isPlaying = false;
    });
  }
});

    // Defining ExpandedTopics 
    interface ExpandedTopics {
        history: boolean;
        cryptocurrency: boolean;
        cuttingedge: boolean;
    }

    // Simplified Topic interface
    interface Topic {
        title: string;
        content: string[];
        key: keyof ExpandedTopics;
    }

    // Initializing variables
    let expandedTopics: ExpandedTopics = {
        history: false,
        cryptocurrency: false,
        cuttingedge: false
    };

    const topics: Topic[] = [
        {
            title: "History of Blockchain Technology",
            content: [
                "Early Foundations (1970s-2000s)",
                "The concept of public key cryptography was introduced by Whitfield Diffie and Martin Hellman in 1976, laying the groundwork for secure communications.",
                "In 1991, Stuart Haber and W. Scott Stornetta proposed a system for timestamps to ensure the integrity of digital documents, which is an early form of blockchain.",
                "Emergence of Cryptocurrencies (2008-2010)",
                "In 2008, an individual or group using the pseudonym Satoshi Nakamoto published the Bitcoin white paper titled \"Bitcoin: A Peer-to-Peer Electronic Cash System.\" This paper outlined a decentralized digital currency that operates without a central authority.",
                "The Bitcoin network was launched in 2009, and the first block, known as the \"genesis block,\" was mined by Nakamoto. Bitcoin introduced the concepts of blockchain as a distributed ledger and mining as a consensus mechanism.",
                "Growth and Innovation (2011-2015)",
                "Other cryptocurrencies, such as Litecoin, were introduced in 2011, featuring faster transaction times and different hashing algorithms.",
                "Vitalik Buterin proposed Ethereum in 2013, a platform that allows developers to create decentralized applications (dApps) and smart contracts, expanding the use of blockchain beyond currency.",
                "Ethereum was launched in 2015, introducing the concept of programmable blockchain. This allowed for complex transactions and applications beyond simple currency transfers."
            ],
            key: "history"
        },
        {
            title: "Development of Crypto Currency Blockchains",
            content: [
                "Here's a detailed explanation of some core cryptocurrency blockchains, focusing on their similarities and differences:",
                "Core Cryptocurrency Blockchains",
                "1. Bitcoin (BTC)",
                "Launch Year: 2009",
                "Consensus Mechanism: Proof of Work (PoW)",
                "Purpose: Digital currency for peer-to-peer transactions.",
                "Key Features:",
                "  Limited Supply: Maximum of 21 million coins.",
                "  Security: Highly secure due to extensive mining and network participation.",
                "  Simplicity: Primarily focused on transactions and store of value.",
                "2. Ethereum (ETH)",
                "Launch Year: 2015",
                "Consensus Mechanism: Transitioning from Proof of Work (PoW) to Proof of Stake (PoS) with Ethereum 2.0.",
                "Purpose: A platform for decentralized applications (dApps) and smart contracts.",
                "Key Features:",
                "  Programmability: Allows developers to create complex smart contracts.",
                "  No Fixed Supply: Ether (ETH) can be issued without a cap, although changes are planned to manage inflation.",
                "  Rich Ecosystem: Supports DeFi, NFTs, and various decentralized applications.",
                "Similarities",
                "- Decentralization: Most core blockchains aim to be decentralized, removing the need for a central authority.",
                "- Cryptographic Security: All use cryptographic techniques to secure transactions and control the creation of new units.",
                "- Distributed Ledger: They utilize a distributed ledger to record transactions, allowing for transparency and immutability.",
                "- Community Governance: Many have some form of community governance or proposals to shape future protocol changes.",
                "Differences",
                "- Consensus Mechanisms: Different blockchains use various consensus mechanisms like PoW, PoS, or hybrid models.",
                "- Scalability Solutions: Each blockchain has its approach to solving scalability issues, such as sharding or layer-2 solutions.",
                "- Smart Contract Capabilities: Some focus solely on transactions, while others offer complex smart contract functionalities.",
                "- Token Economics: The supply, issuance, and utility of native tokens vary across different blockchains."
            ],
            key: "cryptocurrency"
        },
        {
            title: "Cutting Edge Blockchains",
            content: [
                "Here's a list of some prominent cutting-edge blockchains as of 2023, known for their innovative features and technologies:",
                "1. Ethereum (ETH)",
                "Key Features: Smart contracts, decentralized applications (dApps), transitioning to Proof of Stake (PoS) for improved scalability and energy efficiency.",
                "Use Cases: DeFi, NFTs, dApps.",
                "2. Solana (SOL)",
                "Key Features: High throughput with thousands of transactions per second (TPS), low fees, and a unique Proof of History (PoH) consensus mechanism.",
                "Use Cases: DeFi, NFTs, gaming.",
                "3. Cardano (ADA)",
                "Key Features: Research-driven development, layered architecture (settlement and computation layers), and Proof of Stake (Ouroboros).",
                "Use Cases: dApps, identity verification, supply chain.",
                "4. Polkadot (DOT)",
                "Key Features: Multi-chain architecture allowing different blockchains to interoperate, parachains for specialized use cases, and shared security.",
                "Use Cases: Cross-chain applications, decentralized finance.",
                "5. Avalanche (AVAX)",
                "Key Features: High throughput, low latency, customizable blockchains (subnets), and unique consensus mechanism (Avalanche consensus).",
                "Use Cases: DeFi, enterprise solutions, dApps.",
                "6. Tezos (XTZ)",
                "Key Features: On-chain governance, self-amending protocol, and a focus on security and formal verification.",
                "Use Cases: Smart contracts, dApps, tokenization.",
                "7. Algorand (ALGO)",
                "Key Features: Pure Proof of Stake (PPoS) for quick finality, low fees, and scalability.",
                "Use Cases: Financial applications, NFTs, and decentralized finance.",
                "8. Fantom (FTM)",
                "Key Features: Directed Acyclic Graph (DAG) technology for high speed and low transaction costs, and compatibility with Ethereum smart contracts.",
                "Use Cases: DeFi, NFTs, and dApps.",
                "9. Near Protocol (NEAR)",
                "Key Features: User-friendly onboarding, sharding for scalability, and an emphasis on developer experience.",
                "Use Cases: dApps, DeFi, and gaming.",
                "10. Harmony (ONE)",
                "Key Features: Sharding technology for scalability, low transaction fees, and fast transaction speeds.",
                "Use Cases: DeFi, NFTs, and cross-chain applications.",
                "11. Zilliqa (ZIL)",
                "Key Features: Shard-based architecture for high throughput and transaction scalability, and smart contract support.",
                "Use Cases: DeFi, gaming, and digital advertising.",
                "12. PulseChain (PLS)",
                "Key Features: Fork of Ethereum aimed at providing lower fees, faster transactions, and an environmentally friendly Proof of Stake mechanism.",
                "Use Cases: dApps, DeFi, token projects.",
                "Conclusion",
                "These blockchains represent some of the most innovative and cutting-edge technologies in the cryptocurrency space today. Each has its unique features, consensus mechanisms, and target use cases, contributing to the diverse and evolving landscape of blockchain technology."
            ],
            key: "cuttingedge"
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

      <h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">Welcome to the Blockchain  and Exchange Information Page</h1>
      
      <h2>Contents</h2>
      <nav>
        <ul>
          <li><a href="#Introduction to blockchain">Introduction to Blockchain</a></li>
          <li><a href="#latest-releases">Latest Blockchain Releases</a></li>
          <li><a href="#exchanges">Exchanges</a></li>
          <li><a href="#popular-exchanges">Links to Popular Exchanges</a></li>
        </ul>
      </nav>

        <section id="Introduction to blockchain">
            <h1 >Introduction to Blockchain </h1>

            <p class="text-xl"> This section has information about blockchain development and technology...</p>
          </section>

</section><div class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 pt-20">
    <!-- Left column for image -->
    <div class="md:w-1/2 mt-8 md:mt-0">
        <img src="bitcoin_block.png" alt="Image is of a bitcoin man, standing in front a chain of blocks, that continue into the background." class="w-full h-auto object-cover sticky top-20" />
    </div>

    <!-- Right column for topics -->
    <div class="md:w-1/2 pl-8">
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
                            <p class="text-white-700 leading-relaxed mb-4">{@html paragraph}</p>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<section class="bg-gray-800 px-6 py-16 text-center">
    <section id="latest-releases">
      <h2 class="mb-4 text-3xl font-bold uppercase text-gold-500">Latest Blockchain Releases</h2>
      <p class="text-xl">Recent updates and releases in the blockchain world...</p>
    </section>
    
    <p>We have been working diligently with developers to make sure that their sites and tools are accessible. As we work with them, we will share them here.</p>
    
    <h2 class="pt-24">Pulse Chain</h2>
    <p>PulseChain is a relatively new blockchain project that emerged in 2022.</p>
    
    <h3>PulseChain Overview</h3>
    <p>Launch Year: 2022 (testnet launched in 2021).</p>
    <p>Consensus Mechanism: Proof of Stake (PoS).</p>
    <p>Purpose: Designed to be a faster and cheaper alternative to Ethereum, specifically for users of the Ethereum ecosystem. It aims to provide a platform for decentralized applications (dApps) and to enhance the functionality of the Ethereum network.</p>
    
    <h3>Key Features</h3>
    <ol>
      <li>Fork of Ethereum: PulseChain is essentially a fork of the Ethereum blockchain, which means it inherits much of Ethereum's codebase and functionality. However, it aims to provide improvements in transaction speed and fees.</li>
      <li>Lower Transaction Fees: One of PulseChain's primary goals is to offer significantly lower transaction fees compared to Ethereum, making it more accessible for users and developers.</li>
      <li>Faster Transactions: PulseChain seeks to achieve faster block times, allowing for quicker confirmation of transactions.</li>
      <li>Ecosystem and Tokens: PulseChain launched with its own native cryptocurrency, Pulse (PLS), and it also aims to support a wide range of ERC-20 tokens by allowing them to exist on its network.</li>
      <li>Environmental Focus: By utilizing a PoS consensus mechanism, PulseChain claims to be more environmentally friendly compared to Proof of Work (PoW) blockchains like Bitcoin.</li>
    </ol>
    
    <h3>Similarities with Other Blockchains</h3>
    <ul>
      <li>Decentralization and Security: Like other blockchains, PulseChain aims to provide a decentralized and secure platform for transactions and applications.</li>
      <li>Smart Contracts: It supports smart contracts, similar to Ethereum, enabling developers to build decentralized applications.</li>
    </ul>
    
    <h3>Differences from Other Blockchains</h3>
    <ul>
      <li>Focus on Ethereum Compatibility: While many blockchains seek to differentiate themselves, PulseChain explicitly targets Ethereum users by offering lower fees and faster transactions.</li>
      <li>Community and Ecosystem: PulseChain has a strong community focus, often associated with the larger Hex community (the cryptocurrency created by Richard Heart, who is also the founder of PulseChain).</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>PulseChain is positioned as a scalable and cost-effective alternative to Ethereum, appealing to users and developers looking for a more efficient platform. While it shares many characteristics with Ethereum and other smart contract-enabled blockchains, its specific focus on improving the Ethereum experience and its community-driven approach set it apart in the ever-evolving blockchain landscape. As it continues to develop, its role and adoption within the broader ecosystem will be evident.</p>
    <h2>Check out Pulse Chain for Yourself:</h2>
<p>To check out Pulse Chain, just follow the link to 
  <a href="https://pulsechain.com" 
     class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500">
    Pulse Chain
  </a>
</p>
</section>

<section class="bg-gray-800 px-6 py-16 text-center">
<section id="exchanges">
    <h2 class="mb-4 text-3xl font-bold uppercase text-gold-500">Exchanges</h2>
    <p class="text-xl">This section will contain general information about cryptocurrency exchanges...</p>

    <h1 style="margin-top: 0.5in; margin-bottom: 0.25in;">Blockchain Exchanges</h1>
    
    <p>
        An exchange on a blockchain is a platform that facilitates the buying, selling, and trading of cryptocurrencies and digital assets. There are two main types of exchanges: centralized exchanges (CEX) and decentralized exchanges (DEX).</p>
    
    <ol>
      <li>
        <h2 style="margin-top: 0.5in; margin-bottom: 0.25in;">Centralized Exchanges (CEX)</h2>
        <p>These are operated by companies that manage the platform and hold users' funds. They provide a user-friendly interface, liquidity, and various trading pairs, but require users to trust the exchange with their assets.</p>
      </li>
    
      <li>
        <h2 style="margin-top: 0.5in; margin-bottom: 0.25in;">Decentralized Exchanges (DEX)</h2  >
        <p>These operate without a central authority, allowing users to trade directly from their wallets. They use smart contracts to facilitate transactions and typically offer greater privacy and control over funds, but may have lower liquidity and a steeper learning curve.</p>
      </li>
    </ol>
    
    <p>Overall, exchanges play a crucial role in the cryptocurrency ecosystem by providing a marketplace for users to convert fiat currencies to crypto and vice versa, as well as trade between different cryptocurrencies.</p>
<p style="margin-bottom: 0.25in;">For more information, check out the video below:</p>
    <div class="video-container">
        <video bind:this={videoElement}>
          <source src="test.MP4" type="video/mp4">
          <track kind="captions" src="captions.VTT" srclang="en" label="English" default>
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div class="controls">
        <button on:click={rewind}>⏪</button>
        <button on:click={togglePlay}>
          {#if isPlaying}
            ⏸️
          {:else}
            ▶️
          {/if}
        </button>
        <button on:click={fastForward}>⏩</button>
      </div>
      <style>
        .video-container {
          width: 576px; /* 6 inches * 96 pixels/inch */
          height: 480px; /* 5 inches * 96 pixels/inch */
          margin: 0 auto;
          border: 32px solid silver; /* Approximately 1/3 inch silver border */
          box-sizing: content-box;
        }
      
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          display: block;
        }
      
        .controls {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
      
        button {
          padding: 10px 20px;
          background-color: silver;
          color: black;
          border: none;
          cursor: pointer;
          margin: 0 5px;
          font-size: 18px;
          transition: background-color 0.3s, color 0.3s;
        }
      
        button:hover, button:active {
          background-color: white;
          color: gold;
        }
      </style>
      
</section>
  <section id="popular-exchanges">
    <h2 style="margin-top: 0.5in; margin-bottom: 0.25in;"class="mb-4 text-3xl font-bold uppercase text-gold-500">Links to Popular Exchanges</h2>
    <ul>
      <li>
        <a
          class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
          href="https://app.uniswap.org"
        >Uniswap on Ethereum</a>
      </li>
      <li>
        <a
          class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
          href="https://pulsex.com"
        >Pulse X on Pulse Chain</a>
      </li>
      <li>
        <a
          class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
          href="https://www.meteora.ag.com"
        >Meteora on Solana</a>
      </li>
    </ul>
      </section>
  
</section>