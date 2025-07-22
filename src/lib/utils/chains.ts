export const chains = {
	arb: {
		name: 'Arbitrum One',
		currency: 'ETH',
		chainId: 42161
	},
	avax: {
		name: 'Avalanche C-Chain',
		currency: 'AVAX',
		chainId: 43114
	},
	base: {
		name: 'Base',
		currency: 'ETH',
		chainId: 8453
	},
	blast: {
		name: 'Blast Mainnet',
		currency: 'ETH',
		chainId: 81457
	},
	bsc: {
		name: 'BNB Smart Chain Mainnet',
		currency: 'BNB',
		chainId: 56
	},
	cro: {
		name: 'Cronos Mainnet',
		currency: 'CRO',
		chainId: 25
	},
	eth: {
		name: 'Ethereum Mainnet',
		currency: 'ETH',
		chainId: 1
	},
	ftm: {
		name: 'Fantom Mainnet',
		currency: 'FTM',
		chainId: 250
	},
	glmr: {
		name: 'Moonbeam',
		currency: 'GLMR',
		chainId: 1284
	},
	linea: {
		name: 'Linea',
		currency: 'ETH',
		chainId: 59144
	},
	mantle: {
		name: 'Mantle Mainnet',
		currency: 'MNT',
		chainId: 5000
	},
	matic: {
		name: 'Polygon Mainnet',
		currency: 'MATIC',
		chainId: 137
	},
	movr: {
		name: 'Moonriver',
		currency: 'MOVR',
		chainId: 1285
	},
	opbnb: {
		name: 'opBNB Mainnet',
		currency: 'BNB',
		chainId: 204
	},
	optimism: {
		name: 'Optimism',
		currency: 'ETH',
		chainId: 10
	},
	polygon_zkevm: {
		name: 'Polygon zkEVM Mainnet',
		currency: 'ETH',
		chainId: 1101
	},
	pulse: {
		name: 'PulseChain',
		currency: 'PLS',
		chainId: 369
	},
	xdai: {
		name: 'Gnosis Chain',
		currency: 'xDAI',
		chainId: 100
	},
	zksync: {
		name: 'zkSync Era Mainnet',
		currency: 'ETH',
		chainId: 324
	}
};

//Creates an array of objects with label and value props from the chains object
export const chainList = Object.entries(chains)
	.map(([key, value]) => ({
		label: `${value.name} (${value.currency})`,
		value: key
	}))
	.sort((a, b) => {
		return a.label.localeCompare(b.label);
	});

export function getChainKeyByMoralisId(moralisId: string): string | undefined {
	const decimalId = parseInt(moralisId, 16);
	return Object.entries(chains).find(([key, value]) => value.chainId === decimalId)?.[0];
}
