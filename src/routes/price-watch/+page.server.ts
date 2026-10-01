import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

function botUsernameFrom(value: string | undefined): string | null {
	if (!value) return null;
	const username = value.trim().replace(/^@/, '');
	if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) return null;
	return username;
}

export function load() {
	const botUsername =
		botUsernameFrom(publicEnv.PUBLIC_TELEGRAM_BOT_USERNAME) ??
		botUsernameFrom(env.TELEGRAM_BOT_USERNAME);
	return { botUsername };
}
