import { createClient } from '@sanity/client';
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from '$env/static/private';

import type { SanityClient } from '@sanity/client';

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
