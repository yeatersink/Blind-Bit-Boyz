import Moralis from 'moralis';
import { MORALIS_API_KEY } from '$env/static/private';

const connectToMoralis = async () => {
	try {
		await Moralis.start({
			apiKey: MORALIS_API_KEY
		});
		console.log('Moralis initialized successfully');
		return true;
	} catch (error) {
		console.error('Error initializing Moralis:', error);
		return false;
	}
};

export const moralisInitialized = await connectToMoralis();
