type SearchType = 'token' | 'pair';

export interface SavedSearch {
	chainId: string;
	name: string;
	address: string;
	type: SearchType;
}

export class SavedSearchService {
	private items: Record<string, SavedSearch> = $state({});
	private itemCount: number = $state(0);

	public constructor() {
		this.loadFromStorage();
	}

	public get count(): number {
		return this.itemCount;
	}

	public has(address: string, chainId: string): boolean {
		return !!this.items[this.makeKey(chainId, address)];
	}

	public add(address: string, name: string, chainId: string, type: SearchType): void {
		const key = this.makeKey(chainId, address);
		this.items[key] = { name, chainId, address, type };
		this.itemCount = Object.keys(this.items).length;
		this.saveToStorage();
	}

	public remove(address: string, chainId: string): void {
		const key = this.makeKey(chainId, address);
		delete this.items[key];
		this.itemCount = Object.keys(this.items).length;
		this.saveToStorage();
	}

	public list(): SavedSearch[] {
		return Object.values(this.items);
	}

	private makeKey(chainId: string, address: string): string {
		return `${chainId}-${address}`;
	}

	private saveToStorage(): void {
		localStorage.setItem('savedSearches', JSON.stringify(this.items));
	}

	private loadFromStorage(): void {
		if (typeof localStorage === 'undefined') {
			// If localStorage is not available (e.g., during SSR), initialize items as an empty object
			this.items = {};
		} else {
			const raw = localStorage.getItem('savedSearches');
			if (raw) {
				this.items = JSON.parse(raw);
			} else {
				this.items = {};
			}
		}
		this.itemCount = Object.keys(this.items).length;
	}
}

export const savedSearchService = new SavedSearchService();
