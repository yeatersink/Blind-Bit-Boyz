import { json } from '@sveltejs/kit';
import { API_UNREACHABLE, omitRpc, PriceWatchApiError } from '$lib/priceWatchApi';
import {
	openAccount,
	sameSiteRequest,
	telegramWidgetAccepted,
	widgetBodyFrom
} from '$lib/server/telegramLogin';

/** Used only when the public API cannot check the Telegram signature itself. */
export const POST = async ({ request, url }) => {
	if (!sameSiteRequest(request, url)) {
		return json({ error: 'Telegram login was rejected.' }, { status: 403 });
	}
	let body: unknown = null;
	try {
		body = await request.json();
	} catch {
		body = null;
	}
	const widget = widgetBodyFrom(body);
	if (!widget) {
		return json({ error: 'Telegram login did not include a hash.' }, { status: 400 });
	}
	try {
		const checked = telegramWidgetAccepted(widget);
		const session = await openAccount({
			telegram_id: checked.id,
			username: checked.username,
			first_name: checked.firstName
		});
		return json(omitRpc({ token: session.token }));
	} catch (error) {
		if (error instanceof PriceWatchApiError && error.status === 0) {
			return json({ error: API_UNREACHABLE }, { status: 502 });
		}
		const message =
			error instanceof PriceWatchApiError ? error.message : 'Telegram login was rejected.';
		return json({ error: message }, { status: 401 });
	}
};
