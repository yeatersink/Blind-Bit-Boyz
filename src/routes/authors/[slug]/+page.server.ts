import { getAuthorBySlug } from '$lib/server/sanity';

export const load = async ({ params }) => {
	const { slug } = params;
	if (!slug) {
		return { author: undefined };
	}
	try {
		const author = await getAuthorBySlug(slug);
		return { author };
	} catch (error) {
		console.error('Error loading author:', error);
		return { author: undefined };
	}
};
