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
        tools: boolean;
        accessible: boolean;
        methods: boolean;
    }

    // Defining Topic, which uses ExpandedTopics
    interface Topic {
        title: string;
        content: string[];
        key: keyof ExpandedTopics;
    }

    // Initializing variables
    let expandedTopics: ExpandedTopics = {
        tools: false,
        accessible: false,
        methods: false
    };

    const topics: Topic[] = [
        {
            title: "The Tools You Will Need",
            content: [
                `<h2>Tools to engage with the Blockchain:</h2>

<p>If you are blind and interested in getting into crypto, then welcome. Blockchain technology is the future, and we need to be involved. Otherwise, technology will leave us behind. I know you are wondering if this is even possible as a blind person, and the answer is yes!</p>

<p>Whether you want to trade, build a business, or use applications built on Blockchain, you will need the following tools:</p>

<ol>
    <li>A Screen Reader. NVDA is free and works great.</li>
    <li>A braille display. Obviously, this is optional.</li>
    <li>A phone or tablet.</li>
    <li>A digital wallet.</li>
</ol>`
            ],
            key: "tools"
        },
        {
            title: "Is Crypto Currency Even Accessible?",
            content: [
                `<h2>Accessibility:</h2>
<p>Trading is very easy to do on a phone, tablet, and on your computer. The challenge is to make sure that your wallet is accessible. You can find out more about accessibility in digital wallets on our wallet page.</p>
<p>There are tools that traders use and the purpose of this page is to share them so you can know what to use, and if they are accessible or not. We also hope to share how to improvise in the case of lack of accessibility.</p>`,

                `<h3>What is Not Accessible:</h3>
<p>The main area of lack of accessibility in the crypto currency space is with the charts that log the progress of the buys and sells of a coin. Currently no website has a fully featured or functioning chart that is accessible with a screen reader. We are working on that here, but the most optimal answer to this problem would be that every charting website used accessible charts.</p>
<p>Getting sites such as Dex Screener, Dex Tools, Coin Market Cap, Coin Gecko, Coin Base, and others fully accessible is the burden of the Blind Bit Boys.</p>
<p>Until then we have two choices:</p>
<ol>
    <li>We have to make accessibility for the charts ourselves, which we are doing.</li>
    <li>We have to Use tools that can help us stay aware with what is going on with a coin.</li>
</ol>`,

                `<h3>Telegram:</h3>
<p>Firstly, Telegram is accessible on Windows and iPhone. However, on Windows, you need to download Unigram which is the Windows version of Telegram. Yes, it is absolutely accessible with NVDA. It is easy to use.</p>
<p>All kinds of Traders of crypto have a Telegram group. It is absolutely a must to engage with Telegram if you are going to trade.</p>
<p>Just be careful not to click on any links in Telegram, there are an innumerable amount of scammers in Telegram groups. If you click a link, it can literally drain your wallet, so be careful.</p>`
            ],
            key: "accessible"
        },
        {
            title: "Methods for Monitoring",
            content: [
                `<h2>Monitoring Methods:</h2>
<p>We are currently working on an accessible chart feature on the Coin Search Page. Check it out. But apart from a Chart, there are other helpful ways to monitor your investment.</p>
<ol>
    <li>
        <h3>Utilizing Dex Screener, Dex Tools, and other coin monitoring sites:</h3>
        <p>I like Dex Screener because it will allow me to close my tab and it will still show the price of the coin on the tab itself.</p>
        <p>On an iPhone for example, you can create a folder for your tabs. I keep all my investments on their own individual tab. This way I can just simply run your finger over it, and hear what the current price of the token is. It is fast, simple and free.</p>
    </li>
    <li>
        <h3>Third party tools:</h3>
        <p>There is another tool that was absolutely life changing for me. It is a bot that works with Telegram called Dropsbot.</p>
        <p>Dropsbot is a bot that will allow you to monitor a token, an adjustable price range for that token, and massive sells of that token.</p>
        <p>It will also allow you to monitor a wallet. It will allow you to monitor liquidity pools, and even the prices of gas fees.</p>
        <p>Dropsbot will allow you to monitor 20 coins for free, by sending you notifications to your Telegram. This is great because the notifications come to phone and computer at the same time.</p>
    </li>
</ol>`
            ],
            key: "methods"
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
        Welcome to the Getting Started Page</h1>
        <nav>
            <h2>Contents</h2>
            <ul>
              <li><a href="#general-info">General Information</a></li>
<li><a href="#get-started">Step by Step Instructions to Get Started</a></li>
<li><a href="#accessible-tools">Accessible Tools</a></li>
            </ul>
          </nav>
          <section id="general-info">
            <h2>General Information</h2>
            <p>This section will contain general information to benefit you if you are blind or working with someone who is blind. </p>
          </section>
    
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
                            <p class="text-white-700 leading-relaxed mb-4">{@html paragraph}</p>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Right column for image -->
    <div class="md:w-1/2 mt-8 md:mt-0">
        <img src="tools_bitcoin.png" alt="Image is of a bit coin guy, working wiht his tools at his workstation." class="w-full h-auto object-cover sticky top-20" />
    </div>
</div>
<section class="bg-gray-800 px-6 py-16 text-center">

<section class="bg-gray-800 px-6 py-16 text-center">
        
  <section id="get-started">
    <h2>Step by Step Instructions to Get Started</h2>
    <h1>Getting Started with Cryptocurrency Trading</h1>

    <h2>Steps to Begin Trading</h2>
  
    <p>To get started , here's what you have to do in order:</p>
  
    <ol>
      <li>
        <p>1. Choose what device you want to use to trade on. You can use phone, tablet, and computer.</p>
      </li>
      <li>
        <p>2. Decide which blockchain you are going to trade on.</p>
      </li>
      <li>
        <p>3. Download a digital wallet that will connect to your blockchain.</p>
      </li>
      <li>
        <p>4. Set your wallet up and connect it to your Blockchain.</p>
      </li>
      <li>
        <p>5. Connect your wallet to the Exchange that you are going to do your trading on.</p>
      </li>
    </ol>
<p style="margin-bottom: 0.50in;">for more information check out our video below:</p>

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
</section>
<section class="bg-gray-800 px-6 py-16 text-center"></section>
  <section id="accessible-tools">
  <h2>Accessible Resources for Trading and Engaging </h2>

    <p >We have been working diligently with developers to make sure that their sites and tools  are accessible. As we work with them, we will share them here.</p>
    

    <h2>Helpful Tools For Monitoring Cryptocurrency:</h2>
  
    <ol>
      <li>
        <p>1. Nearly everyone uses Telegram, so you have to utilize telegram as an investor and as a developer.Accessible on IPhone, and windows with NVDA and an NVDA add-on.</p>
      </li>
      <li>
        <p>2. You have to monitor the market. You do this through third party sites such as Dex Screener, Dex Tools, Coin Base, Coin Gecko, and Coin Market Cap. All of these are very good tools, but you must know that the charts are not readable with a screen reader.</p>
      </li>
      
      <li>
        <p>3. The best tool out there I have found is Dropsbot. You can find it here 
          <a
            class="border-b border-gray-300 hover:border-gold-400 hover:text-gold-500 focus:border-gold-400 focus:text-gold-500"
            href="https://dropstab.com/products/drops-bot"
          >Dropsbot</a>.
        </p>
      </li>
      <p style="margin-bottom: 0.50in;">for more information check out our video below:</p>


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

</section>

