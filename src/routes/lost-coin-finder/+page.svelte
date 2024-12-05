<script lang="ts">
    let walletAddress:string = "";
    let results:Array<any>=[]

    async function getCoinsFromWallet(){
        const response = await fetch(`https://api.scan.pulsechain.com/api?module=account&action=tokenlist&address=${walletAddress}`)
        const data=await response.json()
        results=data.result
    }

function formatBalance(balance:string,decimals:string) {
    return (parseInt(balance)/(10**parseInt(decimals))).toFixed(parseInt(decimals))
}
</script>

<svelte:head>
<title>Welcome to Your Lost Coin Finder!</title>
</svelte:head>

<h1>Welcome to your Lost Coin Finder!</h1>
<p>Have you purchased coins and forgotten about them? This tool will help you dig up coins in your wallet that you have long forgotten about, and you don't even have to connect your wallet to find them.</p>
<p>Using this tool is simple. Just put your wallet address in the search bar, and then choose which block chain that you purchased your coin on, and let the Lost Coin Finder locate them for you.</p>

<form onsubmit={(event)=>{
    event.preventDefault()
    getCoinsFromWallet()
}}>
    <label for="walletAddress">Enter Wallet Address</label>
    <input id="walletAddress" type="search" bind:value={walletAddress}/>
<button>Search for Wallet</button>
</form>

{#if results.length>0}
<h2>Coins Owned by this Wallet: {results.length}</h2>
{#each results as result}
<a href={`/coins/${result.contractAddress}`}>
<h3>{result.name}</h3>
<p>{result.contractAddress}</p>
</a>
<button onclick={() => navigator.clipboard.writeText(result.contractAddress)}>Copy Contract Address</button>
<p>Balance: {formatBalance(result.balance,result.decimals)}</p>
<p>Symbol: {result.symbol}</p>
<p>Type: {result.type}</p>
{/each}
{/if}