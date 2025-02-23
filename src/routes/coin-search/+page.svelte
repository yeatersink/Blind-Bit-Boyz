<script lang="ts">
    import { goto } from '$app/navigation';
    import { request, gql } from 'graphql-request';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';  

    // Toggle function  
    function toggleContent(key: keyof ExpandedTopics): void {
        expandedTopics[key] = !expandedTopics[key];
    }

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
        token: boolean;
        dataprovider: boolean;
        technicalanalysis: boolean;
    }

    // Defining Topic, which uses ExpandedTopics
    interface Topic {
        title: string;
        content: string[];
        key: keyof ExpandedTopics;
    }

    // Initializing variables
    let expandedTopics: ExpandedTopics = {
        token: false,
        dataprovider: false,
        technicalanalysis: false
    };

    const topics: Topic[] = [
        {
            title: "What is a Token?",
            content: [
                "In the context of cryptocurrency, tokens are digital assets created and managed on a blockchain. They can represent a variety of assets or utilities and possess distinct characteristics. Here's a detailed description:",
                // ... (rest of the content remains the same)
            ],
            key: "token"
        },
        {
            title: "How to Research A Token",
            content: [
                "To effectively research cryptocurrencies using platforms like Dex Screener, DexTools, CoinMarketCap, and CoinGecko, you can follow these steps:",
                "Dex Screener and DexTools",
                "These platforms focus on decentralized exchanges (DEXs), providing real-time data and insights.",
                "Key Features:",
                // ... (rest of the content)
                "By leveraging these tools, you can perform thorough research on cryptocurrencies, helping you make informed investment decisions and stay updated on market dynamics."
            ],
            key: "dataprovider"
        },
        {
            title: "What is Technical Analysis?",
            content: [
                "Technical Analysis (TA) is a method used to evaluate and predict future price movements of assets like cryptocurrencies through the study of past market data, primarily price and volume. Unlike fundamental analysis, which assesses the intrinsic value of an asset, TA focuses on identifying patterns and trends in market behavior.",
                "How is Technical Analysis Done?",
                // ... (rest of the content)
                "3. Market Timing: Understanding TA can help you time the market better, aiming to maximize returns by buying low and selling high.",
                "4. Increased Confidence: With a solid understanding of TA, traders often feel more confident in their trading strategies.",
                "5. Versatility: TA can be applied to any market or asset, making it a valuable skill across different trading environments.",
                "By learning and applying TA, you can gain insights into market dynamics and improve your trading strategies, potentially leading to better investment outcomes."
            ],
            key: "technicalanalysis"
        }
    ];

// Here 
    
//     //The query string
//     let query = $state('');
//     // Used to track the status of the search
//     let status: 'loading' | 'done' | 'error' | undefined = $state(undefined);
//     //The options for sorting the results
//     let sortingOptions: Array<{ name: string; value: string }> = [
//         { name: 'Name Ascending', value: 'name-asc' },
//         { name: 'Name Descending', value: 'name-desc' },
//         { name: 'Price Ascending', value: 'price-asc' },
//         { name: 'Price Descending', value: 'price-desc' },
//         { name: 'Symbol Ascending', value: 'symbol-asc' },
//         { name: 'Symbol Descending', value: 'symbol-desc' }
//     ];
//     //The current sorting option
//     let currentSortingOption: string = $state(sortingOptions[0].value);
//     let sortingDirection: 'asc' | 'desc' = $state('asc');
// let currentSearchType: 'token'|'pair'|'both'|undefined = $state(undefined);

//     //The type of the results
//     type resultType = {
//         name: string;
//         symbol: string;
//         address: string;
// url: string;
//         price: number;
//         chainId?: string;
//         pairedToken?: {
//             pairAddress: string;
//             name: string;
//             symbol: string;
//             address: string;
//         };
//     };
//     let results: Array<resultType> = $state([]);
//     let prices: { [key: string]: { price: string; name: string } } = {};
//     let dataProvidersList: {
// [key: string]: {
//         name: string;
//         searchType:'token'|'pair'|'both'
//     }} = {
//         dexscreener:{ name: 'Dex Screener', searchType:'pair' },
//         pulse:{ name: 'Pulsechain', searchType:'both'}
//     };
//     let currentDataProvider: string = $state(Object.keys(dataProvidersList)[0]);
//     let blockchainList = [{ name: 'Pulse Chain', value: 'pls' }];
//     let currentBlockchain: string = $state(blockchainList[0].value);

//     async function searchCryptocurrencies() {
//         status = 'loading';
//         results = [];
//         if (currentDataProvider == 'dexscreener') {
//             searchDexscreener();
//         } else if (currentDataProvider == 'pulse') {
//             searchPulseChain();
//         }
//     }

//     async function searchDexscreener() {
//         let data: any;
//         //Checks if the user entered a contract address
//         if (query.startsWith('0x') && query.length == 42) {
//             const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
//             data = await response.json();
//         } else {
//             const response = await fetch(
//                 `https://api.dexscreener.com/latest/dex/search?q=${currentBlockchain}/${query}`
//             );
//             data = await response.json();
//         }
//         for (let item of data.pairs) {
//             results.push({
//                 name: item.baseToken.name,
//                 symbol: item.baseToken.symbol,
//                 address: item.baseToken.address,
//                 url: `${item.baseToken.address}?dataProvider=${currentDataProvider}&chainId=${item.chainId}&pairAddress=${item.pairAddress}`,
//                 price: item.priceUsd,
//                 chainId: item.chainId,
//                 pairedToken: {
//                     pairAddress: item.pairAddress,
//                     name: item.quoteToken.name,
//                     symbol: item.quoteToken.symbol,
//                     address: item.quoteToken.address
//                 }
//             });
//         }
//         status = 'done';
//         sortResults();
//     }

//     async function searchPulseChain() {
//         let data: any;
//         const endPoint = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex';
//         let gqlQuery = gql``;
//         let variables: { [key: string]: string } = {};
//         if (currentSearchType=='token') {
//         if (query.startsWith('0x') && query.length == 42) {
//             gqlQuery = gql`
//                 query GetToken($address: String!) {
//                     token(id: $address) {
//                         id
//                         name
//                         symbol
//                         derivedUSD
//                     }
//                 }
//             `;
//             variables = {
//                 address: query
//             };
//         } else {
//             gqlQuery = gql`
//                 query GetTokens($name: String!, $symbol: String!) {
//                     tokens(
//                         where: { or: [{ name_contains_nocase: $name }, { symbol_contains_nocase: $symbol }] }
//                     ) {
//                         id
//                         name
//                         symbol
//                         derivedUSD
//                     }
//                 }
//             `;
//             variables = {
//                 name: query,
//                 symbol: query
//             };
//         }
//         try {
//             data = await request(endPoint, gqlQuery, variables);

//             if (data.token) {
//                 results = [
//                     {
//                         name: data.token.name,
//                         symbol: data.token.symbol,
//                         address: data.token.id,
//                         url: `${data.token.id}?dataProvider=${currentDataProvider}`,
//                         price: data.token.derivedUSD
//                     }
//                 ];
//             } else {
//                 results = data.tokens.map((token: any) => ({
//                     name: token.name,
//                     symbol: token.symbol,
//                     address: token.id,
// url: `${token.id}?dataProvider=${currentDataProvider}`,
//                     price: token.derivedUSD
//                 }));
//             }
//             status = 'done';
//             sortResults();
//         } catch (error) {
//             console.error(error);
//             status = 'error';
//         }
//     } else if(currentSearchType=='pair') {
//         if (query.startsWith('0x') && query.length == 42) {
//             gqlQuery = gql`
//                 query GetPair($address: String!) {
//                     pair(id: $address) {
//                         id
//                         name
// token0{derivedUSD}
// token0{symbol}
// token1{symbol}
//                     }
//                 }
//             `;
//             variables = {
//                 address: query
//             };
//         } else {
//             gqlQuery = gql`
//                 query GetPairs($name: String!) {
//                     pairs(
//                         where: { name_contains_nocase: $name }
//                     ) {
//                         id
//                         name
// token0{derivedUSD}
// token0{symbol}
// token1{symbol}
//                     }
//                 }
//             `;
//             variables = {
//                 name: query,
//             };
//         }
//         try {
//             data = await request(endPoint, gqlQuery, variables);

//             if (data.pair) {
//                 results = [
//                     {
//                         name: data.pair.name,
//                         symbol: data.pair.token0.symbol + '/' + data.pair.token1.symbol,
//                         address: data.pair.id,
//                         url: `${data.pair.id}?dataProvider=${currentDataProvider}`,
//                         price: data.pair.token0.derivedUSD
//                     }
//                 ];
//             } else {
//                 results = data.pairs.map((pair: any) => ({
//                     name: pair.name,
//                     symbol: pair.token0.symbol + '/' + pair.token1.symbol,
//                     address: pair.id,
// url: `${pair.id}?dataProvider=${currentDataProvider}`,
//                     price: pair.token0.derivedUSD
//                 }));
//             }
//             status = 'done';
//             sortResults();
//         } catch (error) {
//             console.error(error);
//             status = 'error';
//         }
//     }
//     }

//     function sortResults() {
//         if (results.length < 2) {
//             return;
//         }

//         switch (currentSortingOption) {
//             case 'name-asc': {
//                 results.sort((a, b) => {
//                     return a.name.localeCompare(b.name);
//                 });
//                 break;
//             }
//             case 'name-desc': {
//                 results.sort((a, b) => {
//                     return b.name.localeCompare(a.name);
//                 });
//                 break;
//             }
//             case 'price-asc': {
//                 results.sort((a, b) => {
//                     if (a.price && b.price) {
//                         return a.price - b.price;
//                     }
//                 });
//                 break;
//             }
//             case 'price-desc': {
//                 results.sort((a, b) => {
//                     if (a.price && b.price) {
//                         return b.price - a.price;
//                     }
//                 });
//                 break;
//             }
//             case 'symbol-asc': {
//                 results.sort((a, b) => {
//                     return a.symbol.localeCompare(b.symbol);
//                 });
//                 break;
//             }
//             case 'symbol-desc': {
//                 results.sort((a, b) => {
//                     return b.symbol.localeCompare(a.symbol);
//                 });
//                 break;
//             }
//         }
//     }

</script>
    <svelte:head>
    <title>Search for a Coin.</title>
</svelte:head>

<section class="bg-gray-800 text-center">
    <h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">
        Welcome to the Token Search and Analysis Page</h1>
        <nav>
            <h2>Contents</h2>
            <ul>
              <li><a href="#introduction">What is a token?</a></li>
              <li><a href="#how-to-provide">How to do Research on a Token</a></li>
              <li><a href="#accessible-tools">Token Search Tool</a></li>
            </ul>
          </nav>
    
</section>
<section class="bg-gray-800 text-center">
<section id="introduction">
    <h2>Introduction to Token Search and Analysis...</h2>
    <p>This section will contain information about researching a token, and offer some insight on Technical Analysis.</p>
  </section>
</section>

<div class="flex flex-col md:flex-row max-w-6xl mx-auto px-4 pt-20">
    <!-- Left column for topics -->
    <div class="md:w-1/2 pr-8">
        {#each topics as topic (topic.key)}
            <div class="topic mb-16">
                <h2 class="text-2xl font-bold text-yellow-500 mb-4">{topic.title}</h2>
                <div class="button-container">
                    <button
                        on:click={() => toggleContent(topic.key)}
                        class="bg-white text-gray-800 hover:text-yellow-500 transition duration-300 mb-6 focus:outline-none font-semibold py-2 px-4 rounded shadow-md hover:shadow-lg"
                        aria-expanded={expandedTopics[topic.key]}
                    >
                        {expandedTopics[topic.key] ? 'Show Less' : 'Show More'}
                    </button>
                </div>

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
        <img src="best_bit_pool.png" alt="Image is of a bitcoin man, swimming in a pool of cash." class="w-full h-auto object-cover sticky top-20" />
    </div>
</div>
<section class="bg-gray-800 px-6 py-16 text-center">
    <section id="how-to-provide">
        <h1>How to Search for a Token</h1>

        <p>Here's a brief list of instructions on how to search for a token using this tool:</p>
        
        <ol>
            <li>1. Connect Choose which data provider. You can currently choose DEX Screener, or Pulse X </li>
        
            <li>2. Select if you want to search for a Token or a Pool.</li>
        
            <li>3. Type the Name, tikker, or the contract address of the token you want to search for.<li>
        
            <li>4. The results will load...It may take a few seconds, but they will eventually get there.  You can click on the Token that you are looking for to get the data pertaining to that token.</li>
            <li>5. Once the Results have populated, you can click on the Token that you are searching for to get the data pertaining to that token.</li>
        
        
        </ol>

<p style="margin-bottom: 0.50in;">Make sure to do thorough research and understand the risks involved before purchasing a token! For more information, check out our video below:</p> 

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
<section class="bg-gray-800 px-6 py-16 text-center">
    <section id="accessible-tools">
        <h2>Token Search:</h2>

    <p >We have been working diligently with developers to make sure that their sites and tools  are accessible. As we work with them, we will share them here.As of right now, none are available.  This is why we are attempting to build one here.</p>
    </section>
</section>

<!-- 
    <h1 class="mb-4 text-3xl font-bold uppercase text-gold-500">Coin Search</h1>
    <form
        class="flex flex-col items-center gap-4 text-left"
        onsubmit={(event) => {
            event.preventDefault();
            searchCryptocurrencies();
        }}
    >
        <div class="flex flex-col items-center gap-2">
            <label for="provider">Choose Your Data Provider</label>
            <select
                id="provider"
                class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                bind:value={currentDataProvider}
            >
                {#each Object.keys(dataProvidersList) as provider}
                    <option value={provider}>{dataProvidersList[provider].name}</option>
                {/each}
            </select>
        </div>

        <div class="flex flex-col items-center gap-2">
            <label for="blockchain">Choose Which Block Chain You Want to Search</label>
            <select
                id="blockchain"
                class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
                bind:value={currentBlockchain}
                disabled={currentDataProvider !== 'dexscreener'}
            >
                {#each blockchainList as blockchain}
                    <option value={blockchain.value}>{blockchain.name}</option>
                {/each}
            </select>
        </div>

        <div class="flex flex-col items-center gap-2">
            <label for="searchtype">What would you like to search for?</label>
            <select
                id="searchtype"
                class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
                bind:value={currentSearchType}
                disabled={dataProvidersList[currentDataProvider].searchType!='both'}
            >
<option value="token">Token</option>
<option value="pair">Pair</option>
            </select>
        </div>

        <div class="flex flex-col items-center gap-2">
            <label for="search">Search Cryptocurrencies</label>
            <div class="flex flex-col items-center">
                <input
                    id="search"
                    class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    type="search"
                    bind:value={query}
                    aria-describedby="search-help"
                />
                <p id="search-help" class="text-sm text-gray-400">
                    You can search by name, symbol, or contract address
                </p>
            </div>
        </div>
        <button
            class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
            type="submit">Search</button
        >
    </form>


<div class="p-6">
    <div role="status" aria-live="polite">
        {#if status == 'loading'}
            <p class="sr-only">Loading...</p>
            <span class="fa-solid fa-spinner fa-spin text-gold-500" aria-hidden="true"></span>
        {:else if status == 'error'}
            <p class="text-red-500" role="alert">An error occurred while fetching the data</p>
        {:else if status == 'done'}
            <h2 class="mb-4 text-2xl font-semibold text-gray-100">Results: {results.length}</h2>
        {/if}
    </div>

    {#if status == 'done'}
        <section class="flex flex-col gap-4">
            {#if results.length > 0}
                <div>
                    <label for="sorting">Sort by:</label>
                    <select
                        id="sorting"
                        class="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-gray-200 hover:border-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                        bind:value={currentSortingOption}
                        onchange={sortResults}
                    >
                        {#each sortingOptions as option}
                            <option value={option.value}>{option.name}</option>
                        {/each}
                    </select>
                </div>
                <div role="separator" class="border-t border-gray-600"></div>
                <ul class="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4">
                    {#each results as result}
                        <li class="rounded-md bg-gray-800 p-4">
                            <a
                                class="visited:text-gold-400 hover:text-gold-500 focus:text-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                href={`/coins/${result.url}`}
                                target="_blank"
                            >
                                <h3 class="text-xl font-semibold">
                                    {result.name}: {result.price ? '$' + result.price : 'Price not available'}
                                </h3>
                            </a>
                            <p>{result.symbol}</p>
                            <div class="flex items-center justify-between">
                                <p>{result.address}</p>
                                <button
                                    class="rounded-md bg-gold-500 px-6 py-2 text-black hover:bg-gold-600 focus:ring-2 focus:ring-gold-500"
                                    onclick={() => navigator.clipboard.writeText(result.address)}
                                    aria-label={`Copy ${result.name} address`}
                                    ><span class="fa-solid fa-copy"></span></button
                                >
                            </div>
                        </li>
                    {/each}
                </ul>
            {:else}
                <p>No results found</p>
            {/if}
        </section>
    {/if}
</div> --> -->
