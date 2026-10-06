import { json } from '@sveltejs/kit';
import { PriceWatchApiError } from '$lib/priceWatchApi';
import {
	CODE_NOT_DELIVERED,
	cleanTelegramId,
	sameSiteRequest,
	sendLoginCode
} from '$lib/server/telegramLogin';

export const POST = async ({ request, cookies, url }) => {
	if (!sameSiteRequest(request, url)) {
		return json({ error: CODE_NOT_DELIVERED }, { status: 403 });
	}
	let body: unknown = null;
	try {
		body = await request.json();
	} catch {
		body = null;
	}
	const telegramId = cleanTelegramId(
		body && typeof body === 'object' && !Array.isArray(body)
			? (body as { telegram_id?: unknown }).telegram_id
			: null
	);
	if (!telegramId) {
		return json({ error: 'Telegram chat id must be digits only.' }, { status: 400 });
	}
	try {
		await sendLoginCode(cookies, telegramId, url.protocol === 'https:');
		return json({ ok: true });
	} catch (error) {
		const message = error instanceof PriceWatchApiError ? error.message : CODE_NOT_DELIVERED;
		return json({ error: message }, { status: 400 });
	}
};
