import { moralisInitialized } from '$lib/server/moralis';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

export async function getTokenHistoricalPrice(
	address: string = '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
	chain = EvmChain.ETHEREUM
) {
	const historicalPrice = [];

	if (!moralisInitialized) {
		return {
			error: 'Moralis is not initialized'
		};
	}

	try {
		for (let toBlock = 16323500; toBlock < 16323550; toBlock += 10) {
			const response = await Moralis.EvmApi.token.getTokenPrice({
				address,
				chain,
				toBlock
			});

			historicalPrice.push(response?.toJSON());
		}
	} catch (error) {
		console.error('Error fetching historical price:', error);
		return {
			error: 'Failed to fetch historical price data'
		};
	}
	console.log(historicalPrice);
	return historicalPrice;
}
