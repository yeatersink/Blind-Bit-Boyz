	import { request, gql } from 'graphql-request';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, url }) => {
	const coinAddress = params.address;
	const dataProvider=url.searchParams.get('dataProvider')
	let coin:{
address:string;
test?:any;
name:string;
imageUrl?:string;
symbol:string;
decimals?:number;
totalSupply?:number;
chain:string;
labels?:string[];
pair?:{
pairAddress:string;
pairCreated:string;
name:string;
address:string;
symbol:string;
};
priceUSD:number;
priceNative:number;
liquidity:number;
fdv?:number;
						tradeVolume?:number;
						tradeVolumeUSD?:number;
						untrackedVolumeUSD?:number;
						totalTransactions?:number;
marketCap?:number;
volume?:{[key:string]:number};
transactions?:{[key:string]:{buys:number,sells:number}};
contactInfo?:{
websites?:{url:string}[];
socials?:{type:string,url:string}[];
};


}|undefined=undefined
	if (dataProvider=="dexscreener") {
	//gets chainId and pairAddress from url params
	const chainId = url.searchParams.get('chainId');
	const pairAddress = url.searchParams.get('pairAddress');

	const response = await fetch(
		`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`
	);
	if (!response.ok) {
		return { status: response.status };
	}
	const data = await response.json();
	const pair = data.pairs[0];
	coin={address:pair.baseToken.address,name:pair.baseToken.name,imageUrl:pair.info.imageUrl,symbol:pair.baseToken.symbol,chain:pair.chainId,labels:pair.labels,pair:{pairAddress:pair.pairAddress,pairCreated:pair.pairCreatedAt,name:pair.quoteToken.name,address:pair.quoteToken.address,symbol:pair.quoteToken.symbol},priceUSD:pair.priceUsd,priceNative:pair.priceNative,liquidity:pair.liquidity.usd,fdv:pair.fdv,marketCap:pair.marketCap,volume:pair.volume,transactions:pair.txns,contactInfo:pair.info}
	 } else if (dataProvider=="pulse") {
		const endPoint = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex';
			const gqlQuery = gql`
				query GetToken($address: String!) {
					token(id: $address) {
						id
						name
						symbol
						derivedUSD
						derivedPLS
decimals
totalSupply
						totalLiquidity
						tradeVolume
						tradeVolumeUSD
						untrackedVolumeUSD
						totalTransactions
						pairBase{name}
pairQuote{name}
					}
				}
			`;
			const variables = {
				address: coinAddress,
			};

		try {
			const data:any = await request(endPoint, gqlQuery, variables);
			if (data.token) {
				coin = {
						name: data.token.name,
						symbol: data.token.symbol,
						decimals: data.token.decimals,
totalSupply:data.token.totalSupply,
						address: data.token.id,
						priceUSD: data.token.derivedUSD,
						priceNative: data.token.derivedPLS,
chain:"Pulse",
						liquidity: data.token.totalLiquidity,
						tradeVolume: data.token.tradeVolume,
						tradeVolumeUSD: data.token.tradeVolumeUSD,
						untrackedVolumeUSD: data.token.untrackedVolumeUSD,
						totalTransactions: data.token.totalTransactions,
					}
if(data.token.pairBase){
coin.test={base:data.token.pairBase,quote:data.token.pairQuote}
}
			} else {
				//Searches for a pair
				const gqlQuery = gql`
				query GetPair($address: String!) {
					pair(id: $address) {
						id
timestamp
token0{id}
						token0{name}
token0{symbol}
						token0{derivedUSD}
						token0{derivedPLS}
token0{decimals}
token0{totalSupply}
						token0{totalLiquidity}
						token0{tradeVolume}
						token0{tradeVolumeUSD}
						token0{untrackedVolumeUSD}
						token0{totalTransactions}
token1{id}
						token1{name}
token1{symbol}
					}
				}
`;

				const variables = {
					address: coinAddress,
				};

				const data:any = await request(endPoint, gqlQuery, variables);

				if (data.pair) {
					coin = {
	address: data.pair.token0.id,
						name: data.pair.token0.name,
						symbol: data.pair.token0.symbol,
						priceUSD: data.pair.token0.derivedUSD,
						priceNative: data.pair.token0.derivedPLS,
						liquidity: data.pair.token0.totalLiquidity,
						tradeVolume: data.pair.token0.tradeVolume,
						tradeVolumeUSD: data.pair.token0.tradeVolumeUSD,
						untrackedVolumeUSD: data.pair.token0.untrackedVolumeUSD,
						totalTransactions: data.pair.token0.totalTransactions,
						decimals: data.pair.token0.decimals,
						chain:"Pulse",
						totalSupply:data.pair.totalSupply,
pair:{
pairAddress:data.pair.id,
pairCreated:data.pair.timestamp*1000,
name:data.pair.token1.name,
address:data.pair.token1.id,
symbol:data.pair.token1.symbol}
					}
				} else {
				return { status: 404, error: 'Token not found' };
				}
			}
		} catch (error) {
			console.error(error);
			return { status: 500, error: 'Internal Server Error while sending the request to pulsechain' };
		}
} else {
	return {error: "Sorry This Data Provider is not Supported Yet."}
}
if (coin){
	return { status: 200, coin };
} else {
	return {status:404,error:"We could not find this Coin."}
}
};
 