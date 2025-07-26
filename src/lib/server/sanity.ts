import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';

// Fix: Add quotes around string values
const SANITY_API_VERSION = '2025-06-19';
const SANITY_DATASET = 'production';
const SANITY_PROJECT_ID = 'n9y8yjln';

let sanityClient: SanityClient | null = null;

if (!checkSanity()) {
	try {
		sanityClient = createClient({
			projectId: SANITY_PROJECT_ID,
			dataset: SANITY_DATASET,
			apiVersion: SANITY_API_VERSION,
			useCdn: true
		});
		console.log('Sanity client created');
	} catch (error) {
		console.error('Error creating Sanity client:', error);
	}
} else {
	console.log('Sanity client already created');
}

function checkSanity() {
	return sanityClient !== null;
}

export async function getAllContent() {
	if (!sanityClient) {
		throw new Error('Sanity client is not initialized');
	}

	try {
		const query = `*[_type == "post"] {
			title,
			"slug": slug.current,
			"authors": authors[]->{
				name
			},
			"categories": categories[]->{
				title
			},
			publishedAt,
		}`;
		const content = await sanityClient.fetch(query);
		return content;
	} catch (error) {
		console.error('Error fetching content from Sanity:', error);
		throw error;
	}
}

export async function getContentBySlug(slug: string) {
	if (!sanityClient) {
		throw new Error('Sanity client is not initialized');
	}

	try {
		const query = `*[_type == "post" && slug.current == $slug][0] {
			title,
			"slug": slug.current,
			"authors": authors[]->{
				name,
				"slug": slug.current
			},
			"categories": categories[]->{
				title
			},
			publishedAt,
			body
		}`;
		const content = await sanityClient.fetch(query, { slug });
		return content;
	} catch (error) {
		console.error('Error fetching content by slug from Sanity:', error);
		throw error;
	}
}

export async function getAuthorBySlug(slug: string) {
	if (!sanityClient) {
		throw new Error('Sanity client is not initialized');
	}

	try {
		const query = `*[_type == "author" && slug.current == $slug][0] {
			name,
			"slug": slug.current,
			bio,
			email,
			"image": image.asset->{
				url
			},
			"socials": socials[]->{
				platform,
				url
			}
		}`;
		const author = await sanityClient.fetch(query, { slug });
		return author;
	} catch (error) {
		console.error('Error fetching author by slug from Sanity:', error);
		throw error;
	}
}
