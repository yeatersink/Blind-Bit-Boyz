import { MORALIS_API_KEY } from '$env/static/private';
import { moralisInitialized } from '$lib/server/moralis';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { dev } from '$app/environment';

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

export async function getPairCandelstickData(
	address: string,
	chain = 'eth',
	startDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
	endDate: Date = new Date(Date.now()),
	interval = '1h',
	currency = 'usd'
) {
	if (!moralisInitialized) {
		return {
			error: 'Moralis is not initialized'
		};
	}

	const url =
		`https://deep-index.moralis.io/api/v2.2/pairs/` +
		`${address}/ohlcv?chain=${chain}&timeframe=${interval}&fromDate=${startDate}&toDate=${endDate}&currency=${currency}`
			.replaceAll(/\s/g, '%20')
			.replaceAll(':', '%3A');
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				'X-API-Key': MORALIS_API_KEY,
				'Content-Type': 'application/json'
			}
		});
		console.log('Response:', response);
		return response?.json();
	} catch (error) {
		console.error('Error fetching pair candlestick data:', error);
		return {
			error: 'Failed to fetch pair candlestick data'
		};
	}
}

export async function getPairData(address: string, chain: string = 'eth') {
	if (dev) {
		console.log('Pair address:', address);
		console.log('Chain:', chain);
	}
	const url =
		`https://deep-index.moralis.io/api/v2.2/pairs/${address}/stats?chain=${chain}`.replace(
			/\s/g,
			'%20'
		);
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				'X-API-Key': MORALIS_API_KEY,
				'Content-Type': 'application/json'
			}
		});
		if (dev) {
			console.log('Response:', response);
		}
		return response?.json();
	} catch (error) {
		console.error('Error fetching pair data:', error);
		return {
			error: 'Failed to fetch pair data'
		};
	}
}
