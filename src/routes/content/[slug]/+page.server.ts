import { getContentBySlug } from '$lib/server/sanity';

export const load = async ({ params }) => {
	const { slug } = params;
	if (!slug) {
		return { post: undefined };
	}
	try {
		const post = await getContentBySlug(slug);
		return { post };
	} catch (error) {
		console.error('Error loading content:', error);
		return { post: undefined };
	}
};
