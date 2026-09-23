export type DataSource = 'gecko' | 'moralis';

export const DATA_SOURCE_STORAGE_KEY = 'dataSource';

export type SearchHit = {
	type: 'token' | 'pair';
	name: string;
	symbol: string;
	tokenAddress?: string;
	pairAddress?: string;
	chainKey: string;
	chainId: string;
	priceUsd?: number | string | null;
	verified?: boolean | null;
	securityScore?: number | null;
};

export type SearchPayload = {
	source: DataSource;
	total: number;
	result: SearchHit[];
};

export function readStoredDataSource(): DataSource {
	if (typeof localStorage === 'undefined') return 'gecko';
	const current = localStorage.getItem(DATA_SOURCE_STORAGE_KEY);
	const legacy = localStorage.getItem('chartDataSource');
	const value = current === 'gecko' || current === 'moralis' ? current : legacy;
	return value === 'moralis' ? 'moralis' : 'gecko';
}

export function storeDataSource(source: DataSource) {
	localStorage.setItem(DATA_SOURCE_STORAGE_KEY, source);
}
