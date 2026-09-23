import { env } from '$env/dynamic/private';
import Moralis from 'moralis';

export const MORALIS_UNAVAILABLE = 'Moralis is unavailable, switch to Gecko Terminal.';

export function getMoralisApiKey(): string | undefined {
	const key = env.MORALIS_API_KEY;
	if (!key || !key.trim()) return undefined;
	return key.trim();
}

const connectToMoralis = async () => {
	const apiKey = getMoralisApiKey();
	if (!apiKey) {
		console.error('MORALIS_API_KEY is not set');
		return false;
	}
	try {
		const core = (Moralis as { Core?: { isStarted?: boolean } }).Core;
		if (core?.isStarted) return true;
		await Moralis.start({
			apiKey
		});
		console.log('Moralis initialized successfully');
		return true;
	} catch (error) {
		const code =
			error && typeof error === 'object' && 'code' in error
				? String((error as { code: unknown }).code)
				: '';
		const message = error instanceof Error ? error.message : String(error);
		if (code === 'C0009' || /started already/i.test(message)) {
			console.log('Moralis already started');
			return true;
		}
		console.error('Error initializing Moralis:', error);
		return false;
	}
};

export const moralisInitialized = await connectToMoralis();
