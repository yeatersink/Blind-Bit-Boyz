import { createHash, createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { API_UNREACHABLE, PRICE_WATCH_API, PriceWatchApiError } from '$lib/priceWatchApi';

export const CODE_NOT_DELIVERED =
	'The code could not be delivered. Press Start in the Blind Bit Boys bot, then try again.';

export const CODE_REJECTED = 'That code is wrong or expired.';

const CODE_COOKIE = 'bbb_pw_login_code';
const CODE_TTL_SECONDS = 600;
const TELEGRAM_ID_PATTERN = /^[0-9]{5,20}$/;
const LOGIN_CODE_PATTERN = /^[0-9]{6}$/;

type PendingCode = {
	tid: string;
	exp: number;
	mac: string;
};

type CookieStore = {
	get: (name: string) => string | undefined;
	set: (
		name: string,
		value: string,
		options: {
			path: string;
			httpOnly: boolean;
			sameSite: 'lax';
			secure: boolean;
			maxAge: number;
		}
	) => void;
	delete: (name: string, options: { path: string }) => void;
};

export type AccountSession = {
	token: string;
	user: Record<string, unknown>;
};

let cachedBotUsername: string | null | undefined;

function botUsernameFrom(value: string | undefined): string | null {
	if (!value) return null;
	const username = value.trim().replace(/^@/, '');
	if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) return null;
	return username;
}

function botToken(): string {
	return env.TELEGRAM_BOT_TOKEN?.trim() ?? '';
}

function mac(secret: string, value: string): string {
	return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export function cleanTelegramId(value: unknown): string | null {
	const text = String(value ?? '').trim();
	if (!TELEGRAM_ID_PATTERN.test(text)) return null;
	return text;
}

export function cleanLoginCode(value: unknown): string | null {
	const text = String(value ?? '').trim();
	if (!LOGIN_CODE_PATTERN.test(text)) return null;
	return text;
}

export async function siteBotUsername(): Promise<string | null> {
	const configured =
		botUsernameFrom(publicEnv.PUBLIC_TELEGRAM_BOT_USERNAME) ??
		botUsernameFrom(env.TELEGRAM_BOT_USERNAME);
	if (configured) return configured;
	if (cachedBotUsername !== undefined) return cachedBotUsername;
	const token = botToken();
	if (!token) {
		cachedBotUsername = null;
		return null;
	}
	try {
		const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
			headers: { Accept: 'application/json' },
			cache: 'no-store'
		});
		const json = (await response.json()) as { ok?: boolean; result?: { username?: unknown } };
		const username = json.ok === true ? json.result?.username : undefined;
		cachedBotUsername = botUsernameFrom(typeof username === 'string' ? username : undefined);
	} catch {
		cachedBotUsername = null;
	}
	return cachedBotUsername;
}

function codeMac(secret: string, telegramId: string, exp: number, code: string): string {
	return mac(secret, `${telegramId}.${exp}.${code}`);
}

function sealPending(secret: string, pending: PendingCode): string {
	const payload = Buffer.from(JSON.stringify(pending), 'utf8').toString('base64url');
	return `${payload}.${mac(secret, payload)}`;
}

function openPending(secret: string, sealed: string | undefined): PendingCode | null {
	if (!sealed) return null;
	const splitAt = sealed.lastIndexOf('.');
	if (splitAt <= 0) return null;
	const payload = sealed.slice(0, splitAt);
	const signature = sealed.slice(splitAt + 1);
	if (!safeEqual(signature, mac(secret, payload))) return null;
	try {
		const parsed = JSON.parse(
			Buffer.from(payload, 'base64url').toString('utf8')
		) as Partial<PendingCode>;
		if (
			!parsed ||
			typeof parsed.tid !== 'string' ||
			typeof parsed.exp !== 'number' ||
			typeof parsed.mac !== 'string'
		) {
			return null;
		}
		if (!TELEGRAM_ID_PATTERN.test(parsed.tid) || !Number.isFinite(parsed.exp)) return null;
		return { tid: parsed.tid, exp: parsed.exp, mac: parsed.mac };
	} catch {
		return null;
	}
}

function cookieOptions(secure: boolean) {
	return {
		path: '/price-watch/login',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure,
		maxAge: CODE_TTL_SECONDS
	};
}

export async function sendLoginCode(
	cookies: CookieStore,
	telegramId: string,
	secure: boolean
): Promise<void> {
	const token = botToken();
	if (!token) throw new PriceWatchApiError(CODE_NOT_DELIVERED, 502);
	const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
	const sent = await deliverCode(token, telegramId, code);
	if (!sent) throw new PriceWatchApiError(CODE_NOT_DELIVERED, 502);
	const exp = Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS;
	cookies.set(
		CODE_COOKIE,
		sealPending(token, { tid: telegramId, exp, mac: codeMac(token, telegramId, exp, code) }),
		cookieOptions(secure)
	);
}

async function deliverCode(token: string, telegramId: string, code: string): Promise<boolean> {
	try {
		const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: telegramId,
				text: `Your Blind Bit Boys login code is ${code}. It expires in 10 minutes.`
			})
		});
		if (!response.ok) return false;
		const json = (await response.json()) as { ok?: boolean };
		return json.ok === true;
	} catch {
		return false;
	}
}

export async function createAccountFromCode(
	cookies: CookieStore,
	telegramId: string,
	code: string
): Promise<AccountSession> {
	const token = botToken();
	if (!token) throw new PriceWatchApiError(CODE_REJECTED, 401);
	const pending = openPending(token, cookies.get(CODE_COOKIE));
	const expected = pending ? codeMac(token, pending.tid, pending.exp, code) : '';
	const matches =
		!!pending &&
		pending.tid === telegramId &&
		pending.exp > Math.floor(Date.now() / 1000) &&
		safeEqual(pending.mac, expected);
	if (!matches) throw new PriceWatchApiError(CODE_REJECTED, 401);
	const session = await openAccount({ telegram_id: telegramId });
	cookies.delete(CODE_COOKIE, { path: '/price-watch/login' });
	return session;
}

export function sameSiteRequest(request: Request, url: URL): boolean {
	const origin = request.headers.get('origin');
	if (origin) return origin === url.origin;
	const referer = request.headers.get('referer');
	if (!referer) return false;
	try {
		return new URL(referer).origin === url.origin;
	} catch {
		return false;
	}
}

type WidgetBody = Record<string, string | number>;

function widgetLines(body: WidgetBody): string[] {
	const lines: string[] = [];
	for (const key of Object.keys(body).sort()) {
		if (key === 'hash') continue;
		const value = body[key];
		if (value === undefined || value === null) continue;
		lines.push(`${key}=${String(value)}`);
	}
	return lines;
}

export function telegramWidgetAccepted(body: WidgetBody): {
	id: string;
	username: string | null;
	firstName: string | null;
} {
	const token = botToken();
	if (!token) throw new PriceWatchApiError('Telegram login was rejected.', 401);
	const theirHash = typeof body.hash === 'string' ? body.hash.trim() : '';
	if (!theirHash) throw new PriceWatchApiError('Telegram login did not include a hash.', 401);
	const secret = createHash('sha256').update(token).digest();
	const digest = createHmac('sha256', secret).update(widgetLines(body).join('\n')).digest('hex');
	if (!safeEqual(digest, theirHash))
		throw new PriceWatchApiError('Telegram login was rejected.', 401);
	const authDate = Number(body.auth_date);
	if (!Number.isFinite(authDate) || Date.now() / 1000 - authDate > 86400) {
		throw new PriceWatchApiError('Telegram login expired.', 401);
	}
	const id = cleanTelegramId(body.id);
	if (!id) throw new PriceWatchApiError('Telegram login was rejected.', 401);
	const username = typeof body.username === 'string' ? body.username.trim() : '';
	const firstName = typeof body.first_name === 'string' ? body.first_name.trim() : '';
	return {
		id,
		username: username || null,
		firstName: firstName || null
	};
}

const WIDGET_KEYS = [
	'id',
	'first_name',
	'last_name',
	'username',
	'photo_url',
	'auth_date',
	'hash'
] as const;

export function widgetBodyFrom(value: unknown): WidgetBody | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const source = value as Record<string, unknown>;
	const body: WidgetBody = {};
	for (const key of WIDGET_KEYS) {
		const item = source[key];
		if (typeof item === 'string' || typeof item === 'number') body[key] = item;
	}
	if (typeof body.hash !== 'string' || body.id === undefined || body.auth_date === undefined)
		return null;
	return body;
}

export async function openAccount(body: {
	telegram_id: string;
	username?: string | null;
	first_name?: string | null;
}): Promise<AccountSession> {
	const payload: Record<string, string> = { telegram_id: body.telegram_id };
	if (body.username) payload.username = body.username;
	if (body.first_name) payload.first_name = body.first_name;
	let response: Response;
	try {
		response = await fetch(`${PRICE_WATCH_API}/auth/telegram`, {
			method: 'POST',
			cache: 'no-store',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch {
		throw new PriceWatchApiError(API_UNREACHABLE, 0);
	}
	let json: unknown = null;
	try {
		json = await response.json();
	} catch {
		json = null;
	}
	if (!response.ok) {
		const message =
			json &&
			typeof json === 'object' &&
			!Array.isArray(json) &&
			typeof (json as { error?: unknown }).error === 'string'
				? (json as { error: string }).error
				: API_UNREACHABLE;
		throw new PriceWatchApiError(message, response.status);
	}
	if (
		!json ||
		typeof json !== 'object' ||
		Array.isArray(json) ||
		typeof (json as { token?: unknown }).token !== 'string' ||
		!(json as { token: string }).token.trim() ||
		!(json as { user?: unknown }).user ||
		typeof (json as { user?: unknown }).user !== 'object'
	) {
		throw new PriceWatchApiError('Sign in did not return an account.', 502);
	}
	return {
		token: (json as { token: string }).token,
		user: (json as { user: Record<string, unknown> }).user
	};
}
