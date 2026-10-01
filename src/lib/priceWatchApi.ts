export const PRICE_WATCH_API = 'https://api.blindbitboys.com';

export const PRICE_WATCH_TOKEN_KEY = 'bbb_pricewatch_token';

export const API_UNREACHABLE = 'The price watch API is not reachable.';

export const PICK_CHAIN_MESSAGE = 'pick this chain before saving a watch';

export const CURRENT_CHAIN_ID = '369';

export const THRESHOLD_FIELDS = [
	{ key: 'price_up_pct', label: 'Price up percent' },
	{ key: 'price_down_pct', label: 'Price down percent' },
	{ key: 'price_dollar_up', label: 'Price up dollars' },
	{ key: 'price_dollar_down', label: 'Price down dollars' },
	{ key: 'liquidity_up_pct', label: 'Liquidity up percent' },
	{ key: 'liquidity_down_pct', label: 'Liquidity down percent' },
	{ key: 'liquidity_dollar_up', label: 'Liquidity up dollars' },
	{ key: 'liquidity_dollar_down', label: 'Liquidity down dollars' },
	{ key: 'volume_up_pct', label: 'Volume up percent' },
	{ key: 'volume_down_pct', label: 'Volume down percent' }
] as const;

export type ThresholdKey = (typeof THRESHOLD_FIELDS)[number]['key'];

export type ThresholdValues = Record<ThresholdKey, number | null>;

export const THRESHOLD_NEGATIVE_MESSAGE =
	'Enter a number zero or greater. Down means how far it falls, not a minus sign.';

export const DOWN_THRESHOLD_HINT = 'Use a positive number. Example: 1 means one percent down.';

const DOWN_THRESHOLD_KEYS = new Set<ThresholdKey>([
	'price_down_pct',
	'price_dollar_down',
	'liquidity_down_pct',
	'liquidity_dollar_down',
	'volume_down_pct'
]);

export function isDownThreshold(key: ThresholdKey): boolean {
	return DOWN_THRESHOLD_KEYS.has(key);
}

/** Blank stays blank. A stored negative is shown as the positive magnitude. */
export function thresholdInputValue(value: number | null): string {
	if (value === null || !Number.isFinite(value)) return '';
	return String(Math.abs(value));
}

export function thresholdMagnitude(value: number | null): number | null {
	if (value === null || !Number.isFinite(value)) return null;
	return Math.abs(value);
}

export type PriceWatchUser = {
	id: string;
	telegram_id: string;
	username: string | null;
	first_name: string | null;
};

export type PriceWatchChain = {
	chain_id: string;
	name: string;
	active: boolean;
};

export type PairResult = {
	pair_address: string;
	token0_address: string;
	token1_address: string;
	token0_symbol: string;
	token1_symbol: string;
	token0_name: string;
	token1_name: string;
	dex: string;
	price_usd: string;
	liquidity_usd: string;
	timestamp: string;
};

export type SearchTokenResult = {
	address: string;
	symbol: string;
	name: string;
};

export type PriceWatchSearchResult = {
	pairs: PairResult[];
	tokens: SearchTokenResult[];
	error: string;
};

export type SavedWatch = {
	id: string;
	chain_id: string;
	pair_address: string;
	token_address: string | null;
	name: string;
	symbol: string;
	active: boolean;
} & ThresholdValues;

export type RankingWindow = '1h' | '24h' | '7d';

export type RankingRow = {
	id: string;
	rank: number | null;
	symbol: string;
	name: string;
	price_change_pct: number | null;
	liquidity_usd: string;
};

export type WatchCreateBody = {
	chain_id: string;
	pair_address: string;
	name: string;
	symbol: string;
	token_address?: string;
} & ThresholdValues;

export class PriceWatchApiError extends Error {
	readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = 'PriceWatchApiError';
		this.status = status;
	}
}

const RPC_KEYS = new Set(['rpc_url', 'rpc_url_fallback']);

const WIDGET_KEYS = [
	'id',
	'first_name',
	'last_name',
	'username',
	'photo_url',
	'auth_date',
	'hash'
] as const;

export type TelegramWidgetAuth = Partial<Record<(typeof WIDGET_KEYS)[number], string | number>> & {
	hash: string;
	id: string | number;
	auth_date: string | number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function omitRpc(value: unknown): unknown {
	if (Array.isArray(value)) return value.map((item) => omitRpc(item));
	if (!isRecord(value)) return value;
	const next: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(value)) {
		if (RPC_KEYS.has(key)) continue;
		next[key] = omitRpc(child);
	}
	return next;
}

export function emptyThresholds(): Record<ThresholdKey, string> {
	return {
		price_up_pct: '',
		price_down_pct: '',
		price_dollar_up: '',
		price_dollar_down: '',
		liquidity_up_pct: '',
		liquidity_down_pct: '',
		liquidity_dollar_up: '',
		liquidity_dollar_down: '',
		volume_up_pct: '',
		volume_down_pct: ''
	};
}

export type ThresholdParseError = {
	key: ThresholdKey;
	message: string;
};

export function parseThresholds(
	values: Record<ThresholdKey, string>
): { ok: true; body: ThresholdValues } | { ok: false; errors: ThresholdParseError[] } {
	const body = {} as ThresholdValues;
	const errors: ThresholdParseError[] = [];
	for (const field of THRESHOLD_FIELDS) {
		const raw = String(values[field.key] ?? '').trim();
		if (raw === '') {
			body[field.key] = null;
			continue;
		}
		if (!/^-?\d+(\.\d+)?$/.test(raw)) {
			errors.push({
				key: field.key,
				message: `${field.label} must be a number, or leave it blank to turn that alert off.`
			});
			continue;
		}
		const numeric = Number(raw);
		if (!Number.isFinite(numeric)) {
			errors.push({
				key: field.key,
				message: `${field.label} must be a number, or leave it blank to turn that alert off.`
			});
			continue;
		}
		if (numeric < 0) {
			errors.push({ key: field.key, message: THRESHOLD_NEGATIVE_MESSAGE });
			continue;
		}
		body[field.key] = numeric;
	}
	if (errors.length > 0) return { ok: false, errors };
	return { ok: true, body };
}

function thresholdPayload(values: ThresholdValues): ThresholdValues {
	const body = {} as ThresholdValues;
	for (const field of THRESHOLD_FIELDS) body[field.key] = thresholdMagnitude(values[field.key]);
	return body;
}

function asNumberOrNull(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value.trim());
	return null;
}

function asText(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return '';
}

function errorText(json: unknown, status: number): string {
	if (isRecord(json) && typeof json.error === 'string' && json.error.trim()) return json.error.trim();
	return `Request failed (${status}).`;
}

function dataList(json: unknown): unknown[] {
	if (!isRecord(json) || !Array.isArray(json.data)) {
		throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	}
	return json.data;
}

async function request(
	path: string,
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	token: string | null,
	body?: unknown
): Promise<unknown> {
	let response: Response;
	try {
		response = await fetch(`${PRICE_WATCH_API}${path}`, {
			method,
			cache: 'no-store',
			headers: {
				Accept: 'application/json',
				...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {})
			},
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
	} catch {
		throw new PriceWatchApiError(API_UNREACHABLE, 0);
	}

	const text = await response.text();
	let json: unknown = null;
	if (text) {
		try {
			json = omitRpc(JSON.parse(text));
		} catch {
			json = null;
		}
	}

	if (!response.ok) throw new PriceWatchApiError(errorText(json, response.status), response.status);
	return json;
}

export async function checkHealth(): Promise<void> {
	let response: Response;
	try {
		response = await fetch(`${PRICE_WATCH_API}/health`, {
			headers: { Accept: 'application/json' },
			cache: 'no-store'
		});
	} catch {
		throw new PriceWatchApiError(API_UNREACHABLE, 0);
	}
	if (!response.ok) throw new PriceWatchApiError(API_UNREACHABLE, response.status);
	let payload: unknown;
	try {
		payload = JSON.parse(await response.text());
	} catch {
		throw new PriceWatchApiError(API_UNREACHABLE, response.status);
	}
	if (isRecord(payload) && payload.ok === false) {
		throw new PriceWatchApiError(API_UNREACHABLE, response.status);
	}
}

export function readStoredToken(): string | null {
	try {
		const value = localStorage.getItem(PRICE_WATCH_TOKEN_KEY);
		if (!value || !value.trim()) return null;
		return value;
	} catch {
		return null;
	}
}

export function storeToken(token: string): boolean {
	try {
		localStorage.setItem(PRICE_WATCH_TOKEN_KEY, token);
		return true;
	} catch {
		return false;
	}
}

export function clearStoredToken(): void {
	try {
		localStorage.removeItem(PRICE_WATCH_TOKEN_KEY);
	} catch {
		// Storage can be blocked. The in-memory token is cleared by the caller.
	}
}

function asUser(value: unknown): PriceWatchUser | null {
	if (!isRecord(value)) return null;
	const telegramId = value.telegram_id;
	if (typeof value.id !== 'string') return null;
	if (typeof telegramId !== 'string' && typeof telegramId !== 'number') return null;
	return {
		id: value.id,
		telegram_id: String(telegramId),
		username: typeof value.username === 'string' ? value.username : null,
		first_name: typeof value.first_name === 'string' ? value.first_name : null
	};
}

function authResult(json: unknown): { token: string; user: PriceWatchUser } {
	if (!isRecord(json) || typeof json.token !== 'string' || json.token.trim() === '') {
		throw new PriceWatchApiError('Sign in did not return a token.', 200);
	}
	const user = asUser(json.user);
	if (!user) throw new PriceWatchApiError('Sign in did not return an account.', 200);
	return { token: json.token, user };
}

export async function signInWithTelegramId(
	telegramId: string
): Promise<{ token: string; user: PriceWatchUser }> {
	const json = await request('/auth/telegram', 'POST', null, { telegram_id: telegramId });
	return authResult(json);
}

export async function signInWithTelegramWidget(
	widget: TelegramWidgetAuth
): Promise<{ token: string; user: PriceWatchUser }> {
	const body: Record<string, string | number> = {};
	for (const key of WIDGET_KEYS) {
		const value = widget[key];
		if (typeof value === 'string' || typeof value === 'number') body[key] = value;
	}
	if (typeof body.hash !== 'string' || body.hash.trim() === '') {
		throw new PriceWatchApiError('Telegram login did not include a hash.', 0);
	}
	const json = await request('/auth/telegram', 'POST', null, body);
	return authResult(json);
}

export function asChain(value: unknown): PriceWatchChain | null {
	if (!isRecord(value)) return null;
	const chainId = value.chain_id;
	if ((typeof chainId !== 'string' && typeof chainId !== 'number') || typeof value.name !== 'string') {
		return null;
	}
	return {
		chain_id: String(chainId),
		name: value.name,
		active: value.active === true
	};
}

export async function getChains(): Promise<PriceWatchChain[]> {
	const json = await request('/chains', 'GET', null);
	return dataList(json)
		.map((item) => asChain(item))
		.filter((item): item is PriceWatchChain => item !== null);
}

export async function getMe(
	token: string
): Promise<{ user: PriceWatchUser; chains: PriceWatchChain[] }> {
	const json = await request('/me', 'GET', token);
	if (!isRecord(json)) {
		throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	}
	const user = asUser(json.user);
	if (!user) throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	const chains = Array.isArray(json.chains)
		? json.chains.map((item) => asChain(item)).filter((item): item is PriceWatchChain => item !== null)
		: [];
	return { user, chains };
}

export async function saveChains(token: string, chainIds: string[]): Promise<PriceWatchChain[]> {
	const json = await request('/me/chains', 'PUT', token, { chain_ids: chainIds });
	return dataList(json)
		.map((item) => asChain(item))
		.filter((item): item is PriceWatchChain => item !== null);
}

function asPair(value: unknown): PairResult | null {
	if (!isRecord(value)) return null;
	const pairAddress = asText(value.pair_address);
	const token0Address = asText(value.token0_address);
	const token1Address = asText(value.token1_address);
	if (!pairAddress || (!token0Address && !token1Address)) return null;
	return {
		pair_address: pairAddress,
		token0_address: token0Address,
		token1_address: token1Address,
		token0_symbol: asText(value.token0_symbol),
		token1_symbol: asText(value.token1_symbol),
		token0_name: asText(value.token0_name),
		token1_name: asText(value.token1_name),
		dex: asText(value.dex),
		price_usd: asText(value.price_usd),
		liquidity_usd: asText(value.liquidity_usd),
		timestamp: asText(value.timestamp)
	};
}

function asSearchToken(value: unknown): SearchTokenResult | null {
	if (!isRecord(value)) return null;
	const address = asText(value.address).trim();
	if (!address) return null;
	return {
		address,
		symbol: asText(value.symbol).trim(),
		name: asText(value.name).trim()
	};
}

function rememberSearchToken(
	tokens: Map<string, SearchTokenResult>,
	address: string,
	symbol: string,
	name: string
) {
	const trimmed = address.trim();
	if (!trimmed) return;
	const key = trimmed.toLowerCase();
	const existing = tokens.get(key);
	if (!existing) {
		tokens.set(key, { address: trimmed, symbol: symbol.trim(), name: name.trim() });
		return;
	}
	if (!existing.symbol && symbol.trim()) existing.symbol = symbol.trim();
	if (!existing.name && name.trim()) existing.name = name.trim();
}

function tokensFromPairs(pairs: PairResult[]): SearchTokenResult[] {
	const tokens = new Map<string, SearchTokenResult>();
	for (const pair of pairs) {
		rememberSearchToken(tokens, pair.token0_address, pair.token0_symbol, pair.token0_name);
		rememberSearchToken(tokens, pair.token1_address, pair.token1_symbol, pair.token1_name);
	}
	return [...tokens.values()];
}

function tokensFromList(value: unknown[]): SearchTokenResult[] {
	const tokens = new Map<string, SearchTokenResult>();
	for (const item of value) {
		const token = asSearchToken(item);
		if (!token) continue;
		rememberSearchToken(tokens, token.address, token.symbol, token.name);
	}
	return [...tokens.values()];
}

export async function searchPairs(query: string): Promise<PriceWatchSearchResult> {
	const q = query.trim();
	const json = await request(`/search?q=${encodeURIComponent(q)}`, 'GET', null);
	if (!isRecord(json)) {
		throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	}
	const error = typeof json.error === 'string' ? json.error.trim() : '';
	const pairs = (Array.isArray(json.data) ? json.data : [])
		.map((item) => asPair(item))
		.filter((item): item is PairResult => item !== null);
	const tokens = Array.isArray(json.tokens) ? tokensFromList(json.tokens) : tokensFromPairs(pairs);
	if (error && pairs.length === 0 && tokens.length === 0) {
		throw new PriceWatchApiError(error, 200);
	}
	return { pairs, tokens, error };
}

function asWatch(value: unknown): SavedWatch | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.symbol !== 'string') {
		return null;
	}
	const chainId = value.chain_id;
	const pairAddress = asText(value.pair_address);
	if ((typeof chainId !== 'string' && typeof chainId !== 'number') || !pairAddress) return null;
	const thresholds = {} as ThresholdValues;
	for (const field of THRESHOLD_FIELDS) {
		thresholds[field.key] = asNumberOrNull(value[field.key]);
	}
	const tokenAddress = asText(value.token_address);
	return {
		id: value.id,
		chain_id: String(chainId),
		pair_address: pairAddress,
		token_address: tokenAddress || null,
		name: value.name,
		symbol: value.symbol,
		active: value.active !== false,
		...thresholds
	};
}

/** A to Z by symbol. Equal symbols keep the order returned by the API. */
export function watchesBySymbol(items: SavedWatch[]): SavedWatch[] {
	return [...items].sort((left, right) =>
		left.symbol.trim().localeCompare(right.symbol.trim(), 'en', { sensitivity: 'base' })
	);
}

export async function listWatches(token: string, telegramId?: string | null): Promise<SavedWatch[]> {
	const params = new URLSearchParams();
	params.set('sort', 'symbol');
	const id = telegramId?.trim() ?? '';
	if (id) params.set('filter[telegram_id][_eq]', id);
	const json = await request(`/me/watches?${params.toString()}`, 'GET', token);
	return watchesBySymbol(
		dataList(json)
			.map((item) => asWatch(item))
			.filter((item): item is SavedWatch => item !== null)
	);
}

export async function createWatch(token: string, body: WatchCreateBody): Promise<SavedWatch> {
	const payload: Record<string, string | number | null> = {
		chain_id: body.chain_id,
		pair_address: body.pair_address,
		name: body.name,
		symbol: body.symbol
	};
	if (body.token_address) payload.token_address = body.token_address;
	const magnitudes = thresholdPayload(body);
	for (const field of THRESHOLD_FIELDS) payload[field.key] = magnitudes[field.key];
	const json = await request('/me/watches', 'POST', token, payload);
	if (!isRecord(json)) {
		throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	}
	const watch = asWatch(json.data);
	if (!watch) throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	return watch;
}

export async function updateWatch(
	token: string,
	id: string,
	thresholds: ThresholdValues
): Promise<SavedWatch> {
	const json = await request(
		`/me/watches/${encodeURIComponent(id)}`,
		'PATCH',
		token,
		thresholdPayload(thresholds)
	);
	if (!isRecord(json)) {
		throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	}
	const watch = asWatch(json.data);
	if (!watch) throw new PriceWatchApiError('The price watch API returned an unexpected response.', 200);
	return watch;
}

export async function deleteWatch(token: string, id: string): Promise<void> {
	await request(`/me/watches/${encodeURIComponent(id)}`, 'DELETE', token);
}

function asRanking(value: unknown, index: number): RankingRow | null {
	if (!isRecord(value)) return null;
	const symbol = asText(value.symbol);
	const name = asText(value.name);
	if (!symbol || !name) return null;
	const rank = asNumberOrNull(value.rank);
	const pairAddress = asText(value.pair_address);
	return {
		id: pairAddress || `row-${index}`,
		rank: rank === null ? null : rank,
		symbol,
		name,
		price_change_pct: asNumberOrNull(value.price_change_pct),
		liquidity_usd: asText(value.liquidity_usd)
	};
}

export async function getRankings(window: RankingWindow): Promise<RankingRow[]> {
	const json = await request(`/rankings?window=${encodeURIComponent(window)}`, 'GET', null);
	return dataList(json)
		.map((item, index) => asRanking(item, index))
		.filter((item): item is RankingRow => item !== null);
}

export type BestPerformingRow = {
	id: string;
	rank: number;
	name: string;
	symbol: string;
	quote_symbol: string;
	price_change_pct: number;
	price_usd: string;
	liquidity_usd: string;
};

export const MESSAGE_TIMER_STORAGE_KEY = 'bbb_pricewatch_message_timer';

/** One day is 24 hours. There is no separate 24-hour choice. */
export const MESSAGE_TIMER_CHOICES = [
	{ value: '', label: 'Off', seconds: null },
	{ value: '300', label: 'Every 5 minutes', seconds: 300 },
	{ value: '600', label: 'Every 10 minutes', seconds: 600 },
	{ value: '900', label: 'Every 15 minutes', seconds: 900 },
	{ value: '1800', label: 'Every 30 minutes', seconds: 1800 },
	{ value: '2700', label: 'Every 45 minutes', seconds: 2700 },
	{ value: '3600', label: 'Every 1 hour', seconds: 3600 },
	{ value: '10800', label: 'Every 3 hours', seconds: 10800 },
	{ value: '21600', label: 'Every 6 hours', seconds: 21600 },
	{ value: '43200', label: 'Every 12 hours', seconds: 43200 },
	{ value: '86400', label: 'Every 1 day', seconds: 86400 },
	{ value: '172800', label: 'Every 2 days', seconds: 172800 },
	{ value: '259200', label: 'Every 3 days', seconds: 259200 },
	{ value: '604800', label: 'Every 7 days', seconds: 604800 }
] as const;

export type MessageTimer = {
	interval_seconds: number | null;
	next_message_at: string | null;
};

const MESSAGE_TIMER_SECONDS = new Set<number>(
	MESSAGE_TIMER_CHOICES.flatMap((choice) => (choice.seconds === null ? [] : [choice.seconds]))
);

function asBestRow(value: unknown): BestPerformingRow | null {
	if (!isRecord(value)) return null;
	const name = asText(value.name).trim();
	const symbol = asText(value.symbol).trim();
	const id = asText(value.id).trim();
	const change = asNumberOrNull(value.price_change_pct);
	const rank = asNumberOrNull(value.rank);
	if (!id || !name || !symbol || change === null || rank === null) return null;
	return {
		id,
		rank,
		name,
		symbol,
		quote_symbol: asText(value.quote_symbol).trim(),
		price_change_pct: change,
		price_usd: asText(value.price_usd),
		liquidity_usd: asText(value.liquidity_usd)
	};
}

export async function getBestPerforming(chainId: string): Promise<BestPerformingRow[]> {
	let response: Response;
	try {
		response = await fetch(`/api/price-watch/best?chain_id=${encodeURIComponent(chainId)}`, {
			headers: { Accept: 'application/json' },
			cache: 'no-store'
		});
	} catch {
		throw new PriceWatchApiError('The best performing list could not be loaded.', 0);
	}
	const text = await response.text();
	let json: unknown = null;
	if (text) {
		try {
			json = JSON.parse(text);
		} catch {
			json = null;
		}
	}
	if (!response.ok) {
		throw new PriceWatchApiError(
			errorText(json, response.status) === `Request failed (${response.status}).`
				? 'The best performing list could not be loaded.'
				: errorText(json, response.status),
			response.status
		);
	}
	return dataList(json)
		.map((item) => asBestRow(item))
		.filter((item): item is BestPerformingRow => item !== null);
}

function readMessageTimerMap(): Record<string, MessageTimer> {
	try {
		const raw = localStorage.getItem(MESSAGE_TIMER_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (!isRecord(parsed)) return {};
		const next: Record<string, MessageTimer> = {};
		for (const [userId, value] of Object.entries(parsed)) {
			if (!isRecord(value)) continue;
			const seconds = asNumberOrNull(value.interval_seconds);
			const at = asText(value.next_message_at);
			if (seconds === null || !MESSAGE_TIMER_SECONDS.has(seconds) || !at) continue;
			next[userId] = { interval_seconds: seconds, next_message_at: at };
		}
		return next;
	} catch {
		return {};
	}
}

export function readMessageTimer(userId: string): MessageTimer {
	const id = userId.trim();
	if (!id) return { interval_seconds: null, next_message_at: null };
	return readMessageTimerMap()[id] ?? { interval_seconds: null, next_message_at: null };
}

/** Off clears the saved interval. Any other choice waits one full interval before the first message. */
export function writeMessageTimer(
	userId: string,
	intervalSeconds: number | null,
	now = Date.now()
): MessageTimer {
	const id = userId.trim();
	if (!id) throw new PriceWatchApiError('Sign in before you save this schedule.', 0);
	const stored = readMessageTimerMap();
	if (intervalSeconds !== null && !MESSAGE_TIMER_SECONDS.has(intervalSeconds)) {
		throw new PriceWatchApiError('Choose a schedule from the list.', 0);
	}
	if (intervalSeconds === null) delete stored[id];
	else {
		stored[id] = {
			interval_seconds: intervalSeconds,
			next_message_at: new Date(now + intervalSeconds * 1000).toISOString()
		};
	}
	try {
		localStorage.setItem(MESSAGE_TIMER_STORAGE_KEY, JSON.stringify(stored));
	} catch {
		throw new PriceWatchApiError('This browser did not keep the schedule.', 0);
	}
	return stored[id] ?? { interval_seconds: null, next_message_at: null };
}

export function publicErrorMessage(error: unknown, token: string | null): string {
	let message = error instanceof PriceWatchApiError ? error.message : API_UNREACHABLE;
	if (token && message.includes(token)) message = message.split(token).join('').trim();
	return message || API_UNREACHABLE;
}
