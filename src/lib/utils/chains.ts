export const chains = {
	arb: {
		name: 'Arbitrum One',
		currency: 'ETH',
		chainId: 42161,
		moralisChain: 'arbitrum',
		geckoNetwork: 'arbitrum'
	},
	avax: {
		name: 'Avalanche C-Chain',
		currency: 'AVAX',
		chainId: 43114,
		moralisChain: 'avalanche',
		geckoNetwork: 'avax'
	},
	base: {
		name: 'Base',
		currency: 'ETH',
		chainId: 8453,
		moralisChain: 'base',
		geckoNetwork: 'base'
	},
	blast: {
		name: 'Blast Mainnet',
		currency: 'ETH',
		chainId: 81457,
		moralisChain: 'blast',
		geckoNetwork: 'blast'
	},
	bsc: {
		name: 'BNB Smart Chain Mainnet',
		currency: 'BNB',
		chainId: 56,
		moralisChain: 'bsc',
		geckoNetwork: 'bsc'
	},
	cro: {
		name: 'Cronos Mainnet',
		currency: 'CRO',
		chainId: 25,
		moralisChain: 'cronos',
		geckoNetwork: 'cro'
	},
	eth: {
		name: 'Ethereum Mainnet',
		currency: 'ETH',
		chainId: 1,
		moralisChain: 'eth',
		geckoNetwork: 'eth'
	},
	ftm: {
		name: 'Fantom Mainnet',
		currency: 'FTM',
		chainId: 250,
		moralisChain: 'fantom',
		geckoNetwork: 'ftm'
	},
	glmr: {
		name: 'Moonbeam',
		currency: 'GLMR',
		chainId: 1284,
		moralisChain: 'moonbeam',
		geckoNetwork: 'glmr'
	},
	linea: {
		name: 'Linea',
		currency: 'ETH',
		chainId: 59144,
		moralisChain: 'linea',
		geckoNetwork: 'linea'
	},
	mantle: {
		name: 'Mantle Mainnet',
		currency: 'MNT',
		chainId: 5000,
		moralisChain: 'mantle',
		geckoNetwork: 'mantle'
	},
	matic: {
		name: 'Polygon Mainnet',
		currency: 'MATIC',
		chainId: 137,
		moralisChain: 'polygon',
		geckoNetwork: 'polygon_pos'
	},
	movr: {
		name: 'Moonriver',
		currency: 'MOVR',
		chainId: 1285,
		moralisChain: 'moonriver',
		geckoNetwork: 'movr'
	},
	opbnb: {
		name: 'opBNB Mainnet',
		currency: 'BNB',
		chainId: 204,
		moralisChain: 'opbnb',
		geckoNetwork: 'opbnb'
	},
	optimism: {
		name: 'Optimism',
		currency: 'ETH',
		chainId: 10,
		moralisChain: 'optimism',
		geckoNetwork: 'optimism'
	},
	polygon_zkevm: {
		name: 'Polygon zkEVM Mainnet',
		currency: 'ETH',
		chainId: 1101,
		moralisChain: 'polygon zkevm',
		geckoNetwork: 'polygon-zkevm'
	},
	pulse: {
		name: 'PulseChain',
		currency: 'PLS',
		chainId: 369,
		moralisChain: 'pulse',
		// Confirmed against GET /networks: the Gecko id is pulsechain, not pulse.
		geckoNetwork: 'pulsechain'
	},
	xdai: {
		name: 'Gnosis Chain',
		currency: 'xDAI',
		chainId: 100,
		moralisChain: 'gnosis',
		geckoNetwork: 'xdai'
	},
	zksync: {
		name: 'zkSync Era Mainnet',
		currency: 'ETH',
		chainId: 324,
		moralisChain: 'zksync',
		geckoNetwork: 'zksync'
	}
};

export type ChainKey = keyof typeof chains;

export const chainList = Object.entries(chains)
	.map(([key, value]) => ({
		label: `${value.name} (${value.currency})`,
		value: key
	}))
	.sort((a, b) => a.label.localeCompare(b.label));

function isChainKey(value: string): value is ChainKey {
	return Object.prototype.hasOwnProperty.call(chains, value);
}

export function getChainKeyByMoralisId(moralisId: string): ChainKey | undefined {
	const decimalId = parseInt(moralisId, 16);
	if (!Number.isFinite(decimalId)) return undefined;
	return Object.entries(chains).find(([, value]) => value.chainId === decimalId)?.[0] as
		| ChainKey
		| undefined;
}

export function getChainNameByMoralisId(moralisId: string): string | undefined {
	const key = getChainKeyByMoralisId(moralisId);
	return key ? chains[key].name : undefined;
}

export function resolveAppChainKey(value: string | null | undefined): ChainKey | undefined {
	if (!value) return undefined;
	const raw = value.trim();
	if (!raw) return undefined;
	const lower = raw.toLowerCase();
	if (isChainKey(lower)) return lower;
	if (lower.startsWith('0x') || /^[0-9a-f]+$/i.test(lower)) {
		const fromHex = getChainKeyByMoralisId(lower.startsWith('0x') ? lower : `0x${lower}`);
		if (fromHex) return fromHex;
	}
	if (/^\d+$/.test(lower)) {
		const id = Number(lower);
		const fromDecimal = Object.entries(chains).find(([, chain]) => chain.chainId === id)?.[0];
		if (fromDecimal && isChainKey(fromDecimal)) return fromDecimal;
	}
	const fromVendor = Object.entries(chains).find(
		([, chain]) => chain.moralisChain.toLowerCase() === lower || chain.geckoNetwork === lower
	)?.[0];
	return fromVendor && isChainKey(fromVendor) ? fromVendor : undefined;
}

export function moralisChainFor(value: string | null | undefined): string | undefined {
	const key = resolveAppChainKey(value);
	return key ? chains[key].moralisChain : undefined;
}

export function geckoNetworkFor(value: string | null | undefined): string | undefined {
	const key = resolveAppChainKey(value);
	return key ? chains[key].geckoNetwork : undefined;
}

export function chainLabel(id: string | null | undefined): string {
	const key = resolveAppChainKey(id);
	if (key) return chains[key].name;
	return id && id.trim() ? id : 'Unknown chain';
}
