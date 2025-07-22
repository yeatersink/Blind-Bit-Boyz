import { getAllContent } from '$lib/server/sanity';

export const load = async () => {
	try {
		const content = await getAllContent();
		return { content };
	} catch (error) {
		console.error('Error loading content:', error);
		return { content: [] };
	}
};
