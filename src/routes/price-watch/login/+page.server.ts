import { siteBotUsername } from '$lib/server/telegramLogin';

export async function load() {
	return { botUsername: await siteBotUsername() };
}
