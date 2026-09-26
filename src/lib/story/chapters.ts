export const storyChapters = [
	{
		id: 'chapter-01',
		label: 'Chapter 1',
		title: 'Bitcoin and the chain',
		slug: 'bitcoin'
	},
	{
		id: 'chapter-02',
		label: 'Chapter 2',
		title: 'Ethereum and DeFi',
		slug: 'ethereum'
	},
	{
		id: 'chapter-03',
		label: 'Chapter 3',
		title: 'Smart contracts',
		slug: 'smart-contracts'
	},
	{
		id: 'chapter-04',
		label: 'Chapter 4',
		title: 'Other blockchains, layer 2s, and PulseChain',
		slug: 'chains'
	},
	{
		id: 'chapter-05',
		label: 'Chapter 5',
		title: 'How to buy on centralized exchanges',
		slug: 'buy-crypto'
	},
	{
		id: 'chapter-06',
		label: 'Chapter 6',
		title: 'Wallets',
		slug: 'wallets'
	},
	{
		id: 'chapter-07',
		label: 'Chapter 7',
		title: 'Who holds the keys',
		slug: 'custody'
	},
	{
		id: 'chapter-08',
		label: 'Chapter 8',
		title: 'Swap on the chain itself',
		slug: 'dex'
	},
	{
		id: 'chapter-09',
		label: 'Chapter 9',
		title: 'Bridges',
		slug: 'bridges'
	},
	{
		id: 'chapter-10',
		label: 'Chapter 10',
		title: 'Yield, farming, providing liquidity',
		slug: 'yield'
	},
	{
		id: 'chapter-11',
		label: 'Chapter 11',
		title: 'Running your own node',
		slug: 'nodes'
	},
	{
		id: 'chapter-12',
		label: 'Chapter 12',
		title: 'Block explorers',
		slug: 'explorers'
	},
	{
		id: 'chapter-13',
		label: 'Chapter 13',
		title: 'Privacy on public chains',
		slug: 'privacy'
	},
	{
		id: 'chapter-14',
		label: 'Chapter 14',
		title: 'Law and public policy',
		slug: 'policy'
	},
	{
		id: 'chapter-15',
		label: 'Chapter 15',
		title: 'Blind Bit Boys',
		slug: 'about'
	}
] as const;

export type StoryChapter = (typeof storyChapters)[number];
export type StorySlug = StoryChapter['slug'];

const learnPhotos: Partial<Record<StorySlug, string>> = {
	bitcoin: '/chapter-01-more-info.jpg',
	ethereum: '/chapter-02-more-info.jpg',
	'smart-contracts': '/chapter-03-more-info.jpg',
	chains: '/chapter-04-more-info.jpg',
	wallets: '/chapter-06-more-info.jpg',
	custody: '/chapter-07-more-info.jpg',
	dex: '/chapter-08-more-info.jpg',
	bridges: '/chapter-09-more-info.jpg',
	yield: '/chapter-10-more-info.jpg',
	explorers: '/chapter-12-more-info.jpg',
	privacy: '/chapter-13-more-info.jpg',
	policy: '/chapter-14-more-info.jpg',
	about: '/chapter-15-more-info.jpg'
};

export function learnPhoto(slug: string | undefined): string | null {
	if (!slug || !(slug in learnPhotos)) return null;
	return learnPhotos[slug as StorySlug] ?? null;
}

export function chapterNeighbors(slug: StorySlug) {
	const index = storyChapters.findIndex((chapter) => chapter.slug === slug);
	const current = storyChapters[index];
	if (!current) {
		throw new Error(`Unknown learn page: ${slug}`);
	}
	return {
		current,
		prev: index > 0 ? storyChapters[index - 1] : undefined,
		next: index < storyChapters.length - 1 ? storyChapters[index + 1] : undefined
	};
}
