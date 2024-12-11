<script lang="ts">
import { onMount } from 'svelte';
    let walletAddress:string = "";
let saveWallet:boolean|undefined;
let walletName:string = "";
let walletList:Array<{address:string;name:string;}> = [];
    let results:Array<any>=[]
let prices:{[key:string]:{price:string; name:string}} = {}

	onMount(async () => {
		if(localStorage.getItem('wallets')) {
walletList = JSON.parse(localStorage.getItem('wallets') || '[]')
		}
	})

    async function getCoinsFromWallet(){
if(saveWallet) {
let exists = false;
if(walletList.find((wallet) => wallet.address === walletAddress)) {
exists = true;
}
if(!exists) {
walletList.push({address:walletAddress,name:walletName})
localStorage.setItem('wallets', JSON.stringify(walletList))
} else {
alert('Wallet already saved')	
	}
        const response = await fetch(`https://api.scan.pulsechain.com/api?module=account&action=tokenlist&address=${walletAddress}`)
        const data=await response.json()
let itemList = [];
	if(data.result.length>30) {
//Splits items into groups of 30
for(let i = 0; i < data.result.length; i+=30) {
itemList.push(data.result.slice(i, i+30))
}
//Get price info for each group of 30 items
for(let items of itemList) {
await getPriceInfo(items)
}
	} else {
await getPriceInfo(data.result);
	}
        results=data.result
    }

function formatBalance(balance:string,decimals:string) {
    return (parseInt(balance)/(10**parseInt(decimals))).toFixed(parseInt(decimals))
}

	async function getPriceInfo(items:Array<any>) {
	try {
	const contractAddresses = items.map((item) => item.contractAddress)
const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddresses.join(',')}`)
const priceInfoList = await response.json()
	for(let priceInfo of priceInfoList.pairs) {
	if(priceInfo.priceUsd) {
		prices[priceInfo.baseToken.address] = {price:`$${priceInfo.priceUsd}`,name:priceInfo.baseToken.name}
	} else {
		prices[priceInfo.baseToken.address] = {price:'N/A',name:priceInfo.baseToken.name}
	}
	}
	} catch (error) {
console.error('Error fetching price info from Dex Screener API');
		console.error(error);
	}
	}
</script>

<svelte:head>
<title>Welcome to Your Lost Coin Finder!</title>
</svelte:head>

<h1>Welcome to your Lost Coin Finder!</h1>
<p>Have you purchased coins and forgotten about them? This tool will help you dig up coins in your wallet that you have long forgotten about, and you don't even have to connect your wallet to find them.</p>
<p>Using this tool is simple. Just put your wallet address in the search bar, and then choose which block chain that you purchased your coin on, and let the Lost Coin Finder locate them for you.</p>
<p>This tool will give you a list of every item in your wallet. Be aware of dust coins or scam coins that have been air dropped into your wallet without your knowledge. This tool is very helpful in finding them in your wallet, but do not actualy connect your wallet  to these scam coins. </p>
<form onsubmit={(event)=>{
    event.preventDefault()
    getCoinsFromWallet()
}}>
    <label for="walletAddress">Enter Wallet Address</label>
    <input required id="walletAddress" type="search" bind:value={walletAddress}/>
{#if walletList && walletList.length>0}
	<label for="walletList">Saved Wallets</label>
	<select id="walletList" bind:value={walletAddress}>
		{#each walletList as wallet}
		<option value={wallet.address}>{wallet.name} ({wallet.address})</option>
		{/each}
	</select>
{/if}
	<input type="checkbox" id="saveWallet" name="saveWallet" bind:group={saveWallet}>
	<label for="saveWallet">Save Wallet</label>
<p>This will save the wallet to your browser's local storage so you can easily access it later.</p>
{#if saveWallet}
	<label for="walletName">Wallet Name</label>
	<input required type="text" id="walletName" placeholder="My Wallet" bind:value={walletName}>
{/if}
<button>Search for Wallet</button>
</form>

{#if results.length>0}
<h2>Coins Owned by this Wallet: {results.length}</h2>
{#each results as result}
<a href={`/coins/${result.contractAddress}`} target="_blank">
<h3>{result.name}</h3>
{#if prices[result.contractAddress]}
<p>Price: {prices[result.contractAddress].price}</p>
{:else}
<p>Price: N/A</p>
{/if}
<p>{result.contractAddress}</p>
</a>
<button onclick={() => navigator.clipboard.writeText(result.contractAddress)}>Copy Contract Address</button>
<p>Balance: {formatBalance(result.balance,result.decimals)}</p>
<p>Symbol: {result.symbol}</p>
<p>Type: {result.type}</p>
{/each}
{/if}