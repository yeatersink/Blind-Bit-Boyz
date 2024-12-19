	import { request, gql } from 'graphql-request';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params, url }) => {
	const coinAddress = params.address;
	const dataProvider=url.searchParams.get('dataProvider')
	let coin:{
address:string;
name:string;
imageUrl?:string;
symbol:string;
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
						totalLiquidity
												
					}
				}
			`;
			const variables = {
				address: coinAddress,
			};

		try {
console.log("Requesting PulseChain data")
			const data:any = await request(endPoint, gqlQuery, variables);
console.log("Data Received")
			if (data.token) {
console.log("Token Found")
				coin = {
						name: data.token.name,
						symbol: data.token.symbol,
						address: data.token.id,
						priceUSD: data.token.derivedUSD,
						priceNative: data.token.derivedPLS,
chain:"Pulse",
						liquidity: data.token.totalLiquidity,

					}
			} else {
				return { status: 404, error: 'Token not found' };
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
