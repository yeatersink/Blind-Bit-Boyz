/** AMM sources the price-watch page can ask the API to use. Add a row here for a new DEX. */

export const PRICE_SOURCES = [
	{ id: 'pulsex', label: 'PLSX v2' },
	{ id: 'liberty', label: 'Liberty Pools' }
] as const;

export const UNISWAP_SOURCE = { id: 'uniswap', label: 'Uniswap' } as const;

export type PriceSourceId = (typeof PRICE_SOURCES)[number]['id'] | typeof UNISWAP_SOURCE.id;

export const DEFAULT_PRICE_SOURCE: PriceSourceId = 'pulsex';

const SOURCE_LIST: readonly { id: PriceSourceId; label: string }[] = [
	...PRICE_SOURCES,
	UNISWAP_SOURCE
];

export function sourcesForChain(chainId: string): readonly { id: PriceSourceId; label: string }[] {
	if (chainId === '1') return [UNISWAP_SOURCE];
	return PRICE_SOURCES;
}

export function sourceForChain(chainId: string, current: string, pulseSource: string = DEFAULT_PRICE_SOURCE): PriceSourceId {
	const options = sourcesForChain(chainId);
	if (options.some((item) => item.id === current)) return current as PriceSourceId;
	if (chainId === '1') return UNISWAP_SOURCE.id;
	if (options.some((item) => item.id === pulseSource)) return pulseSource as PriceSourceId;
	return DEFAULT_PRICE_SOURCE;
}

export function isPriceSource(value: string): value is PriceSourceId {
	return SOURCE_LIST.some((item) => item.id === value);
}

export function priceSourceLabel(value: string | null | undefined): string {
	const id = (value ?? '').trim();
	const found = SOURCE_LIST.find((item) => item.id === id);
	return found ? found.label : PRICE_SOURCES[0].label;
}

/** Watches with no source, or an unknown source, stay in the PLSX v2 section. */
export function groupBySource<T extends { source?: string | null }>(
	items: T[]
): { id: PriceSourceId; label: string; items: T[] }[] {
	const groups = new Map<PriceSourceId, T[]>();
	for (const item of items) {
		const raw = (item.source ?? '').trim();
		const id: PriceSourceId = isPriceSource(raw) ? raw : DEFAULT_PRICE_SOURCE;
		const list = groups.get(id);
		if (list) list.push(item);
		else groups.set(id, [item]);
	}
	return SOURCE_LIST.filter((source) => groups.has(source.id)).map((source) => ({
		id: source.id,
		label: source.label,
		items: groups.get(source.id) ?? []
	}));
}
