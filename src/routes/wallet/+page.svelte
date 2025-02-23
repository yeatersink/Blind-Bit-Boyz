<script lang="ts">
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

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
        digitalwallet: boolean;
        commonwallet: boolean;
        cryptowallet: boolean;
    }

    // Defining Topic, which uses ExpandedTopics
    interface Topic {
        title: string;
        content: string[];
        key: keyof ExpandedTopics;
    }

    // Initializing variables
    let expandedTopics: ExpandedTopics = {
        digitalwallet: false,
        commonwallet: false,
        cryptowallet: false
    };

    const topics: Topic[] = [
        {
      title: "Introduction to the Digital Wallet",
      content: [
        "What is a Digital Wallet?",
        "A digital wallet, also known as an e-wallet, is a software application or online service that allows individuals to store, send, and receive digital currency and other forms of electronic payment. Here's a detailed breakdown of its features, functionalities, and benefits:",
        "Key Features:",
        "1. Storage of Payment Information:",
        " Digital wallets securely store various payment methods, including credit/debit card information, bank account details, and cryptocurrency addresses.",
        " Users can add multiple payment options for convenience.",
        
        "Conclusion:",
        "In summary, a digital wallet is a versatile tool that enhances the way people manage and make financial transactions. It combines convenience with security, catering to the evolving needs of consumers in an increasingly digital world.",
        "How to Get a Digital Wallet:",
        "Using a digital wallet involves several steps, and its functionality can vary based on the type of wallet and its intended purpose. Here's a detailed explanation of how to use a digital wallet:",
        // ... (continue with the rest of the content)
        "Conclusion:",
        "Using a digital wallet is a straightforward process that enhances convenience and security in managing financial transactions. By following these steps, users can effectively leverage the various functionalities of digital wallets for everyday payments, money transfers, and financial management."
      ],
      key: "digitalwallet"
    },

      {
        title: "Common Digital Wallets",
      content: [
        "Here's a list of some of the most popular digital wallets, the blockchains they support, and their key features:",

        "1. PayPal",
        "Supported Blockchains: Primarily fiat currencies (USD, EUR, etc.), limited cryptocurrency support (Bitcoin, Ethereum, Litecoin, Bitcoin Cash).",
        "Key Features:",
        "- Easy online payments and money transfers.",
        "- Buyer protection for eligible purchases.",
        "- Integration with e-commerce platforms.",
        "- Mobile app for on-the-go transactions.",
        "- Cryptocurrency buying, selling, and holding.",

        "2. Venmo",
        "Supported Blockchains: Primarily fiat currencies (USD).",
        "Key Features:",
        "- Peer-to-peer payments with social feed for sharing transactions.",
        "- Instant transfer to bank accounts (for a fee).",
        "- QR code scanning for easy payments.",
        "- Ability to pay for purchases at select merchants.",

        "3. Apple Pay",
        "Supported Blockchains: Primarily fiat currencies (USD, EUR, etc.).",
        "Key Features:",
        "- Contactless payments using NFC technology.",
        "- Integration with Apple devices (iPhone, iPad, Apple Watch).",
        "- Secure payments with Face ID, Touch ID, or passcode.",
        "- Ability to store loyalty cards and tickets.",

        // ... continue with other wallets ...

        "10. Exodus Wallet",
        "Supported Blockchains: Supports multiple cryptocurrencies including Bitcoin, Ethereum, and over 100 altcoins.",
        "Key Features:",
        "- User-friendly interface designed for beginners.",
        "- Built-in exchange for swapping cryptocurrencies.",
        "- Portfolio tracking to monitor asset performance.",
        "- Mobile and desktop versions available.",

        "Conclusion",
        "These digital wallets cater to various user needs, from simple peer-to-peer payments to advanced cryptocurrency management. When choosing a wallet, consider the supported blockchains, security features, and specific functionalities that align with your financial activities and preferences."
      ],
      key: "commonwallet"
    },

    {
      title: " Most Common Wallets used for Trading Crypto Currency ",
      content: [
        "Here's a list of the top 10 most popular digital wallets for trading cryptocurrency.",

        "1. Coinbase",
        "Supported Cryptocurrencies: Bitcoin, Ethereum, Litecoin, and many others.",
        "Key Features:",
        "- User-friendly interface suitable for beginners.",
        "- Integrated exchange for easy buying and selling.",
        "- High security with two-factor authentication.",
        "- Mobile app for trading on the go.",

        "2. Binance",
        "Supported Cryptocurrencies: Supports hundreds of cryptocurrencies.",
        "Key Features:",
        "- Extensive trading options, including spot and futures trading.",
        "- Low trading fees compared to other exchanges.",
        "- Advanced charting tools and analysis features.",
        "- Mobile app for trading anywhere.",

        "3. Kraken",
        "Supported Cryptocurrencies: Bitcoin, Ethereum, Ripple, and many more.",
        "Key Features:",
        "- High liquidity and a wide range of trading pairs.",
        "- Advanced trading features, including margin trading.",
        "- Strong security measures, including cold storage.",
        "- User-friendly mobile app.",

        // ... continue with other wallets ...

        "10. Ledger Live",
        "Supported Cryptocurrencies: Supports thousands of cryptocurrencies (when used with Ledger hardware wallets).",
        "Key Features:",
        "- Combines hardware wallet security with software wallet functionality.",
        "- Allows direct trading and managing of assets within the app.",
        "- Portfolio tracking features.",
        "- Highly secure, as private keys are stored offline.",

        "Conclusion",
        "This updated list includes some of the most popular and trusted wallets and exchanges for trading cryptocurrency, featuring a mix of centralized and decentralized options. Each wallet offers unique features tailored to different user preferences and trading styles. When selecting a wallet, consider factors such as security, user experience, and supported cryptocurrencies."
      ],
      key: "cryptowallet"
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
        Welcome to the Digital Wallet Page</h1>

        <nav>
            <h2>Contents</h2>
            <ul>
              <li><a href="#introduction">Introduction to Digital Wallets</a></li>
              <li><a href="#accessible-wallets">Accessible Wallets with Screen Readers</a></li>
              <li><a href="#wallet-tracking">Wallet Tracking and Portfolio Resources</a></li>
            </ul>
        </nav>
    
        <section id="introduction">
            <h2>Introduction to Digital Wallets</h2>
            <p class="text-xl"> This section will contain information explaining digital wallets and how they are used.</p>
        </section>
    </section>
<div class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 pt-20">
    <!-- Left column for image -->
    <div class="md:w-1/2 mt-8 md:mt-0 md:order-first">
        <img src="bitcoin_wallet.png" alt="Image is of a bit coin guy, sitting on a couch, covered in wallets." class="w-full h-auto object-cover sticky top-20" />
    </div>

    <!-- Right column for topics -->
    <div class="md:w-1/2 md:pl-8">
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
<section id="accessible-wallets">
    <h2>Accessible Wallets with Screen Readers</h2>
    <ol>
        <li>1. Most wallets are very accessible for both phones, tablets, and computers, especially if they work on IOs devices.</li>
      
        <li>2. As is the case with Centralized Exchanges, or Decentralized Exchanges, Centralized Exchanges may have their own wallets. It is best just to download the wallet you are interested in using, and checking it out for your self.</li>
      
        <li>3. For Decentralized Exchanges, MetaMask is the recommended wallet for most people. Nearly every button is labeled in MetaMask, but with a bit of help, you can easily label those buttons yourself on your phone or tablet devices. MetaMask works fine with NVDA on computer. Once this is done, MetaMask will be a nice work horse for you.</li>
      
        <li>4. You can find MetaMask in your app store, or simply do a google search. As you get acquainted with trading crypto currency, your tastes will change, and so will your desire for wallets that are better suited for your preferences.</li>
      </ol>
        
      <p style="margin-bottom: 0.50in;">For more information about wallets and the accessibility of MetaMask, check out our bvideo below:</p>


      <div class="video-container">
        <video bind:this={videoElement}>
          <source src="walletintro.mp4" type="video/mp4">
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

<section class="bg-gray-800 px-6 py-16 text-center">
    
        <section id="wallet-tracking">
            <h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">Accessible Resources for Wallet and Portfolio Tracking</h1>
        
    <p class="text-xl">We have been working diligently with developers to make sure that their sites and tools  are accessible. As we work with them, we will share them here. </p>

    <h2 class="pt-24">PLS 369:</h2>
	<p>PLS 369 is a site that will allow you to search any wallet on Pulse Chain with the necessary  wallet address. You can search for your wallet or anyone elses wallet. The results show up on the site or are downloadable. This site is very valuable in in being able to keep track of your own Portfolio. It is especially nice because it will give you a list of every token you have in your wallet. It will give you the balance of those tokens. Including how many of those tokens you possess, the price of the coin, and the total value of the balance of those tokens.  It will also give you a total value the wallet is worth which is comprised of all the tokens possessed by the wallet.</p>
	<p>To use this site, just follow the link 		<a
		class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
		href="https://pls369.com/">PLS 369</a
	>, and follow the instructions. The developer has been very willing to make sure that the site is accessible with a screen reader.</p>  

	
</section>
</section>
