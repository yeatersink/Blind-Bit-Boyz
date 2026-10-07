import { json } from '@sveltejs/kit';
import { API_UNREACHABLE, omitRpc, PriceWatchApiError } from '$lib/priceWatchApi';
import {
	CODE_REJECTED,
	CODE_REQUIRED,
	cleanLoginCode,
	cleanTelegramId,
	createAccountFromCode,
	loginFromCode,
	sameSiteRequest
} from '$lib/server/telegramLogin';

export const POST = async ({ request, cookies, url }) => {
	if (!sameSiteRequest(request, url)) {
		return json({ error: CODE_REJECTED }, { status: 403 });
	}
	let body: unknown = null;
	try {
		body = await request.json();
	} catch {
		body = null;
	}
	const record =
		body && typeof body === 'object' && !Array.isArray(body)
			? (body as { telegram_id?: unknown; code?: unknown; action?: unknown })
			: {};
	const telegramId = cleanTelegramId(record.telegram_id);
	const codeText =
		typeof record.code === 'string' ? record.code : record.code == null ? '' : String(record.code);
	const code = cleanLoginCode(codeText);
	if (!telegramId) {
		return json({ error: 'Telegram chat id must be digits only.' }, { status: 400 });
	}
	if (!codeText.trim()) {
		return json({ error: CODE_REQUIRED }, { status: 400 });
	}
	if (!code) {
		return json({ error: CODE_REJECTED }, { status: 400 });
	}
	const create = record.action === 'create';
	try {
		const session = create
			? await createAccountFromCode(cookies, telegramId, code)
			: await loginFromCode(cookies, telegramId, code);
		return json(omitRpc({ token: session.token }));
	} catch (error) {
		if (error instanceof PriceWatchApiError && error.status === 0) {
			return json({ error: API_UNREACHABLE }, { status: 502 });
		}
		const message = error instanceof PriceWatchApiError ? error.message : CODE_REJECTED;
		const status = message === CODE_REJECTED ? 401 : 400;
		return json({ error: message }, { status });
	}
};
