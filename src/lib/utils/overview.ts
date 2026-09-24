import type { DataSource } from '$lib/utils/searchResults';

export type OverviewRow = { label: string; value: string };

export type OverviewPool = {
	name: string;
	pairAddress: string;
	chainKey: string;
	priceUsd: string;
	liquidityUsd: string;
	volume24hUsd: string;
	dex: string;
	active: boolean;
	change24h: string;
	createdAt: string | null;
};

export type PageOverview = {
	source: DataSource;
	kind: 'token' | 'pair';
	name: string;
	symbol: string;
	chainKey: string;
	tokenAddress: string | null;
	pairAddress: string | null;
	createdAt: string | null;
	rows: OverviewRow[];
	pools: OverviewPool[];
	error: string | null;
};

export function displayValue(value: unknown): string {
	if (value === null || value === undefined) return 'n/a';
	if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'n/a';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (typeof value === 'string') return value.trim() ? value.trim() : 'n/a';
	return 'n/a';
}

export function saneNumber(value: unknown): number | null {
	const numeric =
		typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	if (!Number.isFinite(numeric) || Math.abs(numeric) > 1e15) return null;
	return numeric;
}

export function usdText(value: unknown): string {
	const numeric = saneNumber(value);
	if (numeric === null) return 'n/a';
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(numeric);
}

export function ageText(value: unknown): string {
	if (typeof value === 'number' && Number.isFinite(value)) return `${value} days`;
	if (typeof value !== 'string' || !value.trim()) return 'n/a';
	const parsed = Date.parse(value);
	if (!Number.isFinite(parsed)) return value.trim();
	const days = Math.max(0, Math.floor((Date.now() - parsed) / 86_400_000));
	return `${value.trim()} (${days} days)`;
}
