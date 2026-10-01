<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
	import {
		API_UNREACHABLE,
		CURRENT_CHAIN_ID,
		PICK_CHAIN_MESSAGE,
		PriceWatchApiError,
		THRESHOLD_FIELDS,
		checkHealth,
		clearStoredToken,
		createWatch,
		deleteWatch,
		DOWN_THRESHOLD_HINT,
		emptyThresholds,
		BOARD_WINDOW_CHOICES,
		SLOW_HORSE_INTERVALS,
		getChains,
		getFastHorses,
		getMe,
		getSlowHorses,
		isBoardWindow,
		isDownThreshold,
		listWatches,
		mergeScheduleUser,
		parseThresholds,
		publicErrorMessage,
		readStoredToken,
		saveBoardAlert,
		saveChains,
		saveMoversAlertEvery,
		searchPairs,
		signInWithTelegramId,
		signInWithTelegramWidget,
		storeToken,
		THRESHOLD_NEGATIVE_MESSAGE,
		thresholdInputValue,
		updateWatch,
		watchesBySymbol,
		type BoardWindow,
		type PairResult,
		type PriceWatchChain,
		type PriceWatchUser,
		type RankingRow,
		type SavedWatch,
		type SearchTokenResult,
		type TelegramWidgetAuth,
		type ThresholdKey
	} from '$lib/priceWatchApi';
	import { MOVERS_SEND_OPTIONS } from '$lib/price-watch-types';

	let { data } = $props();

	type Health = 'checking' | 'down' | 'up';
	type WatchDraft = {
		id: string | null;
		chainId: string;
		pairAddress: string;
		tokenAddress: string | null;
		name: string;
		symbol: string;
		baseSymbol: string;
		quoteSymbol: string;
	};
	type PendingRemove = { id: string; name: string; source: 'form' | 'list'; triggerId: string };

	const HORSE_REFRESH_MS = 15_000;

	let health = $state<Health>('checking');
	let restoring = $state(false);
	let token: string | null = null;
	let user = $state<PriceWatchUser | null>(null);
	let accountNote = $state('');
	let accountError = $state('');
	let telegramId = $state('');
	let signInError = $state('');
	let signingIn = $state(false);

	let chainCatalog = $state<PriceWatchChain[]>([]);
	let chainsLoaded = $state(false);
	let selectedChainIds = $state<string[]>([]);
	let chainsError = $state('');
	let chainsStatus = $state('');
	let savingChains = $state(false);

	let query = $state('');
	let submittedQuery = $state('');
	let results = $state<PairResult[] | null>(null);
	let resultTokens = $state<SearchToken[] | null>(null);
	let selectedTokenAddress = $state<string | null>(null);
	let searched = $state(false);
	let searchError = $state('');
	let searchStatus = $state('');
	let searching = $state(false);
	let searchSeq = 0;

	let draft = $state<WatchDraft | null>(null);
	let thresholdValues = $state(emptyThresholds());
	let thresholdErrors = $state<Partial<Record<ThresholdKey, string>>>({});
	let watchError = $state('');
	let watchStatus = $state('');
	let savingWatch = $state(false);
	let toastText = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;
	const pairSidesByAddress = new Map<string, { symbol: string; quoteSymbol: string }>();
	let pendingRemove = $state<PendingRemove | null>(null);
	let removeError = $state('');
	let removing = $state(false);

	let watches = $state<SavedWatch[] | null>(null);
	let watchesLoading = $state(false);
	let watchesError = $state('');
	let listStatus = $state('');

	let watchlistOpen = $state(false);
	let fastOpen = $state(true);
	let slowOpen = $state(false);
	let fastRows = $state<RankingRow[] | null>(null);
	let slowRows = $state<RankingRow[] | null>(null);
	let fastError = $state('');
	let slowError = $state('');
	let fastUpdated = $state('');
	let slowUpdated = $state('');
	let slowShownWindow = $state<BoardWindow>('15m');
	let draftReturnId = 'search-heading';
	let fastSeq = 0;
	let slowSeq = 0;
	let fastTimer: ReturnType<typeof setInterval> | null = null;
	let slowTimer: ReturnType<typeof setInterval> | null = null;
	let fastEvery = $state('0');
	let slowEvery = $state('0');
	let boardWindow = $state<BoardWindow>('15m');
	let fastSaveError = $state('');
	let slowSaveError = $state('');
	let fastSaveStatus = $state('');
	let slowSaveStatus = $state('');
	let savingFast = $state(false);
	let savingSlow = $state(false);

	let widgetCleanup: (() => void) | null = null;

	type SearchToken = SearchTokenResult;

	function isContractQuery(value: string): boolean {
		return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
	}

	function rememberToken(
		tokens: Map<string, SearchToken>,
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

	function orderQueryFirst(list: SearchToken[], q: string): SearchToken[] {
		if (!isContractQuery(q)) return list;
		const queryKey = q.trim().toLowerCase();
		return [...list].sort((left, right) => {
			const leftRank = left.address.toLowerCase() === queryKey ? 0 : 1;
			const rightRank = right.address.toLowerCase() === queryKey ? 0 : 1;
			return leftRank - rightRank;
		});
	}

	function tokensFromResults(pairs: PairResult[], q: string): SearchToken[] {
		const tokens = new Map<string, SearchToken>();
		for (const pair of pairs) {
			rememberToken(tokens, pair.token0_address, pair.token0_symbol, pair.token0_name);
			rememberToken(tokens, pair.token1_address, pair.token1_symbol, pair.token1_name);
		}
		if (pairs.length > 0 && isContractQuery(q)) rememberToken(tokens, q.trim(), '', '');
		return orderQueryFirst([...tokens.values()], q);
	}

	function pairLiquidity(pair: PairResult): number | null {
		if (!pair.liquidity_usd.trim()) return null;
		const value = Number(pair.liquidity_usd);
		return Number.isFinite(value) ? value : null;
	}

	function pairsByLiquidity(pairs: PairResult[]): PairResult[] {
		return [...pairs].sort((left, right) => {
			const leftLiquidity = pairLiquidity(left);
			const rightLiquidity = pairLiquidity(right);
			if (leftLiquidity === null && rightLiquidity === null) return 0;
			if (leftLiquidity === null) return 1;
			if (rightLiquidity === null) return -1;
			return rightLiquidity - leftLiquidity;
		});
	}

	function pairIncludesToken(pair: PairResult, address: string): boolean {
		const key = address.toLowerCase();
		return (
			pair.token0_address.toLowerCase() === key || pair.token1_address.toLowerCase() === key
		);
	}

	function sideLabel(symbol: string, address: string): string {
		const text = symbol.trim();
		if (text) return text;
		return address.trim() || 'Unknown token';
	}

	function pairLabel(pair: PairResult): string {
		const left = sideLabel(pair.token0_symbol, pair.token0_address);
		const right = sideLabel(pair.token1_symbol, pair.token1_address);
		return `${left} / ${right}`;
	}

	function pairSides(pair: PairResult): { symbol: string; quoteSymbol: string } {
		return {
			symbol: sideLabel(pair.token0_symbol, pair.token0_address),
			quoteSymbol: sideLabel(pair.token1_symbol, pair.token1_address)
		};
	}

	function symbolsFromText(name: string, symbol: string): { symbol: string; quoteSymbol: string } {
		for (const value of [name, symbol]) {
			const parts = value
				.split(/\s*\/\s*/)
				.map((part) => part.trim())
				.filter(Boolean);
			if (parts.length >= 2) return { symbol: parts[0], quoteSymbol: parts[1] };
		}
		return { symbol: symbol.trim() || name.trim(), quoteSymbol: '' };
	}

	function sidesForSaved(watch: Pick<SavedWatch, 'pair_address' | 'name' | 'symbol'>): {
		symbol: string;
		quoteSymbol: string;
	} {
		const key = watch.pair_address.toLowerCase();
		const remembered = pairSidesByAddress.get(key);
		if (remembered) return remembered;
		const listed = results?.find((pair) => pair.pair_address.toLowerCase() === key);
		if (listed) {
			const sides = pairSides(listed);
			pairSidesByAddress.set(key, sides);
			return sides;
		}
		return symbolsFromText(watch.name, watch.symbol);
	}

	function chainName(chainId: string): string {
		const chain = chainCatalog.find((item) => item.chain_id === chainId);
		if (chain) return chain.name;
		return `Chain ${chainId}`;
	}

	function watchNotice(verb: 'Added' | 'Updated', item: WatchDraft): string {
		return `${verb} ${item.baseSymbol} / ${item.quoteSymbol} on ${chainName(item.chainId)}.`;
	}

	function tokenLabel(item: SearchToken): string {
		return item.symbol.trim() || item.address;
	}

	function tokenFilterPressed(item: SearchToken): boolean {
		if (!selectedTokenAddress) return false;
		return selectedTokenAddress.toLowerCase() === item.address.toLowerCase();
	}

	function showPairsFor(item: SearchToken) {
		selectedTokenAddress = item.address;
		void focusId('pairs-heading');
	}

	function showAllPairs() {
		selectedTokenAddress = null;
		void focusId('pairs-heading');
	}

	const activeChains = $derived(chainCatalog.filter((chain) => chain.active));
	const searchTokens = $derived.by(() => {
		if (resultTokens && resultTokens.length > 0) return orderQueryFirst(resultTokens, submittedQuery);
		if (results) return tokensFromResults(results, submittedQuery);
		return [];
	});
	const orderedPairs = $derived(results ? pairsByLiquidity(results) : []);
	const visiblePairs = $derived(
		selectedTokenAddress
			? orderedPairs.filter((pair) => pairIncludesToken(pair, selectedTokenAddress))
			: orderedPairs
	);
	const selectedToken = $derived.by(() => {
		if (!selectedTokenAddress) return null;
		const key = selectedTokenAddress.toLowerCase();
		return searchTokens.find((item) => item.address.toLowerCase() === key) ?? null;
	});
	const currentChain = $derived(
		chainCatalog.find((chain) => chain.chain_id === CURRENT_CHAIN_ID) ?? null
	);
	const extraSaved = $derived(
		selectedChainIds.filter((id) => !activeChains.some((chain) => chain.chain_id === id))
	);

	function chainLabel(chainId: string): string {
		const chain = chainCatalog.find((item) => item.chain_id === chainId);
		if (chain) return `${chain.name}, chain ${chain.chain_id}`;
		return `Chain ${chainId}`;
	}

	function watchChainId(): string {
		const current = activeChains.find((chain) => chain.chain_id === CURRENT_CHAIN_ID);
		if (current) return current.chain_id;
		if (activeChains[0]) return activeChains[0].chain_id;
		return CURRENT_CHAIN_ID;
	}

	function usdText(value: string): string {
		if (!value) return 'n/a';
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return 'n/a';
		return formatCryptoPrice(numeric);
	}

	function clockText(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
	}

	function sentText(value: string): string {
		const time = Date.parse(value);
		if (!Number.isFinite(time)) return value;
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(time);
	}

	function windowLabel(value: BoardWindow): string {
		return BOARD_WINDOW_CHOICES.find((item) => item.value === value)?.label ?? '15 minutes';
	}

	function pairTitle(row: RankingRow): string {
		const symbol = row.symbol.trim();
		const quote = row.quote_symbol.trim();
		if (symbol && quote) return `${symbol}/${quote}`;
		if (symbol) return symbol;
		return row.name.trim();
	}

	function gainText(value: number | null, frame: string): string {
		if (value === null || !Number.isFinite(value)) {
			return frame ? `Gain: not available ${frame}.` : 'Gain: not available.';
		}
		const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
		return frame ? `Gain: ${amount}% ${frame}.` : `Gain: ${amount}%.`;
	}

	function horseItemId(list: 'fast' | 'slow', row: RankingRow, index: number): string {
		const key = (row.pair_address || row.id).replace(/[^a-zA-Z0-9_-]/g, '');
		return `${list}-horse-${key || 'row'}-${index}`;
	}

	function fastAnnouncement(seconds: number): string {
		const choice = MOVERS_SEND_OPTIONS.find((item) => item.seconds === seconds);
		if (!choice || seconds === 0) return 'Fast Horses set to off.';
		const phrase = choice.label.charAt(0).toLowerCase() + choice.label.slice(1);
		return `Fast Horses set to ${phrase}.`;
	}

	function slowAnnouncement(window: BoardWindow, seconds: number): string {
		const label = windowLabel(window);
		const choice = SLOW_HORSE_INTERVALS.find((item) => item.seconds === seconds);
		if (!choice || seconds === 0) return `Slow Horses set to the ${label} list, sending off.`;
		const phrase = choice.label.charAt(0).toLowerCase() + choice.label.slice(1);
		return `Slow Horses set to the ${label} list, sent ${phrase}.`;
	}

	function nextDueText(lastSent: string | null, everySeconds: number, name: string): string {
		if (everySeconds <= 0) return `No ${name} message is scheduled.`;
		if (!lastSent) return `The next ${name} message is due on the bot's next check.`;
		const last = Date.parse(lastSent);
		if (!Number.isFinite(last)) return `The next ${name} message is due on the bot's next check.`;
		const due = last + everySeconds * 1000;
		if (due <= Date.now()) return `The next ${name} message is due now.`;
		return `The next ${name} message is due ${sentText(new Date(due).toISOString())}.`;
	}

	function showHorseSchedule(next: PriceWatchUser) {
		fastEvery = MOVERS_SEND_OPTIONS.some((item) => item.seconds === next.movers_alert_every)
			? String(next.movers_alert_every)
			: '0';
		slowEvery = SLOW_HORSE_INTERVALS.some((item) => item.seconds === next.board_alert_every)
			? String(next.board_alert_every)
			: '0';
		boardWindow = next.board_alert_window;
		fastSaveError = '';
		slowSaveError = '';
	}

	function clearHorseSchedule() {
		fastEvery = '0';
		slowEvery = '0';
		boardWindow = '15m';
		fastSaveError = '';
		slowSaveError = '';
		fastSaveStatus = '';
		slowSaveStatus = '';
	}

	function setLimits(watch: SavedWatch): { label: string; value: string }[] {
		return THRESHOLD_FIELDS.flatMap((field) => {
			const value = watch[field.key];
			if (value === null || value === 0) return [];
			return [{ label: field.label, value: thresholdInputValue(value) }];
		});
	}

	async function focusId(id: string) {
		await tick();
		const node = document.getElementById(id);
		if (!(node instanceof HTMLElement)) return;
		node.focus();
		node.scrollIntoView({ block: 'nearest' });
	}

	function isLoginError(error: unknown): boolean {
		return error instanceof PriceWatchApiError && error.status === 401;
	}

	function dropSession(message: string) {
		clearStoredToken();
		token = null;
		user = null;
		watches = null;
		selectedChainIds = [];
		accountNote = '';
		restoring = false;
		signInError = message;
		const previousWindow = boardWindow;
		clearHorseSchedule();
		if (slowOpen && previousWindow !== '15m') void loadSlow('15m', true);
	}

	function clearWidget() {
		widgetCleanup?.();
		widgetCleanup = null;
	}

	function mountWidget(username: string) {
		const host = document.getElementById('telegram-login-widget');
		if (!host) return;
		const win = window as unknown as Record<string, unknown>;
		win.onTelegramAuth = (widgetUser: Partial<TelegramWidgetAuth>) => {
			void signInFromWidget(widgetUser);
		};
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://telegram.org/js/telegram-widget.js?22';
		script.dataset.telegramLogin = username;
		script.dataset.size = 'large';
		script.dataset.onauth = 'onTelegramAuth(user)';
		script.dataset.requestAccess = 'write';
		host.replaceChildren(script);
		widgetCleanup = () => {
			delete win.onTelegramAuth;
			host.replaceChildren();
			widgetCleanup = null;
		};
	}

	async function syncWidget() {
		clearWidget();
		if (health !== 'up' || user || !data.botUsername) return;
		await tick();
		mountWidget(data.botUsername);
	}

	async function loadChains() {
		chainsError = '';
		try {
			chainCatalog = await getChains();
			chainsLoaded = true;
		} catch (error) {
			chainCatalog = [];
			chainsLoaded = false;
			chainsError = publicErrorMessage(error, token);
		}
	}

	async function loadFast() {
		if (!fastOpen) return;
		const seq = ++fastSeq;
		try {
			const rows = await getFastHorses();
			if (seq !== fastSeq || !fastOpen) return;
			fastRows = rows;
			fastError = '';
			fastUpdated = clockText(new Date());
		} catch (error) {
			if (seq !== fastSeq || !fastOpen) return;
			fastError = publicErrorMessage(error, null);
		}
	}

	async function loadSlow(window: BoardWindow = boardWindow, reset = false) {
		if (!slowOpen) return;
		const seq = ++slowSeq;
		if (reset) {
			slowRows = null;
			slowError = '';
		}
		try {
			const rows = await getSlowHorses(window);
			if (seq !== slowSeq || window !== boardWindow || !slowOpen) return;
			slowRows = rows;
			slowShownWindow = window;
			slowError = '';
			slowUpdated = clockText(new Date());
		} catch (error) {
			if (seq !== slowSeq || window !== boardWindow || !slowOpen) return;
			slowError = publicErrorMessage(error, null);
		}
	}

	function stopFastRefresh() {
		fastSeq += 1;
		if (fastTimer) clearInterval(fastTimer);
		fastTimer = null;
	}

	function stopSlowRefresh() {
		slowSeq += 1;
		if (slowTimer) clearInterval(slowTimer);
		slowTimer = null;
	}

	function startFastRefresh() {
		stopFastRefresh();
		const first = loadFast();
		fastTimer = setInterval(() => {
			void loadFast();
		}, HORSE_REFRESH_MS);
		return first;
	}

	function startSlowRefresh() {
		stopSlowRefresh();
		const first = loadSlow();
		slowTimer = setInterval(() => {
			void loadSlow();
		}, HORSE_REFRESH_MS);
		return first;
	}

	function toggleFastHorses() {
		if (fastOpen) {
			fastOpen = false;
			stopFastRefresh();
			return;
		}
		fastOpen = true;
		void startFastRefresh();
	}

	function toggleSlowHorses() {
		if (slowOpen) {
			slowOpen = false;
			stopSlowRefresh();
			return;
		}
		slowOpen = true;
		void startSlowRefresh();
	}

	function chooseSlowWindow(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement) || !isBoardWindow(select.value)) return;
		boardWindow = select.value;
		if (select.value === slowShownWindow && slowRows !== null) return;
		void loadSlow(select.value, true);
	}

	async function loadWatches() {
		if (!token) {
			watches = null;
			return;
		}
		watchesError = '';
		watchesLoading = true;
		try {
			watches = await listWatches(token, user?.telegram_id);
		} catch (error) {
			const message = publicErrorMessage(error, token);
			watches = null;
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			watchesError = message;
		} finally {
			watchesLoading = false;
		}
	}

	async function loadAccount() {
		if (!token) return;
		accountError = '';
		try {
			const me = await getMe(token);
			const previousWindow = boardWindow;
			user = me.user;
			selectedChainIds = me.chains.map((chain) => chain.chain_id);
			showHorseSchedule(me.user);
			await loadWatches();
			if (
				slowOpen &&
				(me.user.board_alert_window !== previousWindow || slowRows === null)
			) {
				await loadSlow(me.user.board_alert_window, me.user.board_alert_window !== previousWindow);
			}
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			accountError = message;
		}
	}

	async function start() {
		try {
			await checkHealth();
		} catch {
			health = 'down';
			await focusId('health-error');
			return;
		}
		health = 'up';
		const stored = readStoredToken();
		const jobs: Promise<void>[] = [loadChains()];
		if (fastOpen) jobs.push(startFastRefresh());
		if (stored) {
			restoring = true;
			token = stored;
			jobs.push(loadAccount());
		}
		await Promise.all(jobs);
		restoring = false;
	}

	async function adoptSession(nextToken: string, nextUser: PriceWatchUser) {
		token = nextToken;
		const stored = storeToken(nextToken);
		user = nextUser;
		telegramId = '';
		signInError = '';
		accountNote = stored
			? ''
			: 'Signed in for this visit. This browser did not keep the sign-in.';
		clearWidget();
		await loadAccount();
		await focusId('account-heading');
	}

	async function submitTelegramId(event: SubmitEvent) {
		event.preventDefault();
		const digits = telegramId.replace(/\D/g, '');
		telegramId = digits;
		if (!/^\d+$/.test(digits)) {
			signInError = 'Telegram id must be digits only.';
			await focusId('sign-in-error');
			return;
		}
		signingIn = true;
		signInError = '';
		try {
			const result = await signInWithTelegramId(digits);
			await adoptSession(result.token, result.user);
		} catch (error) {
			signInError = publicErrorMessage(error, null);
			await focusId('sign-in-error');
		} finally {
			signingIn = false;
		}
	}

	async function signInFromWidget(widgetUser: Partial<TelegramWidgetAuth>) {
		if (
			typeof widgetUser.hash !== 'string' ||
			widgetUser.id === undefined ||
			widgetUser.auth_date === undefined
		) {
			signInError = 'Telegram login did not include a hash.';
			await focusId('sign-in-error');
			return;
		}
		signingIn = true;
		signInError = '';
		try {
			const result = await signInWithTelegramWidget({
				id: widgetUser.id,
				hash: widgetUser.hash,
				auth_date: widgetUser.auth_date,
				first_name: widgetUser.first_name,
				last_name: widgetUser.last_name,
				username: widgetUser.username,
				photo_url: widgetUser.photo_url
			});
			await adoptSession(result.token, result.user);
		} catch (error) {
			signInError = publicErrorMessage(error, null);
			await focusId('sign-in-error');
		} finally {
			signingIn = false;
		}
	}

	async function signOut() {
		clearStoredToken();
		token = null;
		user = null;
		watches = null;
		selectedChainIds = [];
		draft = null;
		pendingRemove = null;
		accountNote = '';
		accountError = '';
		listStatus = '';
		watchStatus = '';
		watchError = '';
		const previousWindow = boardWindow;
		clearHorseSchedule();
		if (slowOpen && previousWindow !== '15m') void loadSlow('15m', true);
		await tick();
		await syncWidget();
		await focusId('sign-in-heading');
	}

	function toggleChain(chainId: string, checked: boolean) {
		if (checked) {
			if (!selectedChainIds.includes(chainId)) selectedChainIds = [...selectedChainIds, chainId];
			return;
		}
		selectedChainIds = selectedChainIds.filter((id) => id !== chainId);
	}

	async function submitChains(event: SubmitEvent) {
		event.preventDefault();
		chainsError = '';
		chainsStatus = '';
		if (!token) {
			signInError = 'Sign in before you save chains.';
			await focusId('sign-in-heading');
			return;
		}
		const chainIds = activeChains
			.filter((chain) => selectedChainIds.includes(chain.chain_id))
			.map((chain) => chain.chain_id);
		savingChains = true;
		try {
			const saved = await saveChains(token, chainIds);
			selectedChainIds = saved.map((chain) => chain.chain_id);
			chainsStatus = saved.length
				? `Saved chains: ${saved.map((chain) => `${chain.name}, chain ${chain.chain_id}`).join('; ')}.`
				: 'Saved chains: none.';
			await focusId('chains-status');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			chainsError = message;
			await focusId('chains-error');
		} finally {
			savingChains = false;
		}
	}

	async function submitSearch(event: SubmitEvent) {
		event.preventDefault();
		const q = query.trim();
		searchError = '';
		searchStatus = '';
		selectedTokenAddress = null;
		if (!q) {
			results = null;
			resultTokens = null;
			searched = false;
			searchError = 'Enter a token name, symbol, or contract address.';
			await focusId('search-error');
			return;
		}
		const seq = ++searchSeq;
		searching = true;
		try {
			const found = await searchPairs(q);
			if (seq !== searchSeq) return;
			results = found.pairs;
			resultTokens = found.tokens;
			submittedQuery = q;
			searched = true;
			selectedTokenAddress = null;
			if (found.error) searchError = found.error;
			const listedTokens =
				found.tokens.length > 0 ? found.tokens : tokensFromResults(found.pairs, q);
			if (found.pairs.length === 0 && listedTokens.length === 0) {
				await focusId(found.error ? 'search-error' : 'search-empty');
				return;
			}
			const tokenCount = listedTokens.length;
			const tokenText = tokenCount === 1 ? '1 token' : `${tokenCount} tokens`;
			const pairText = found.pairs.length === 1 ? '1 pair' : `${found.pairs.length} pairs`;
			searchStatus = `${tokenText}. ${pairText}.`;
			await focusId('tokens-heading');
		} catch (error) {
			if (seq !== searchSeq) return;
			results = null;
			resultTokens = null;
			searched = false;
			selectedTokenAddress = null;
			searchError = publicErrorMessage(error, token);
			await focusId('search-error');
		} finally {
			if (seq === searchSeq) searching = false;
		}
	}

	function draftFromPair(pair: PairResult, q: string): WatchDraft {
		const queryText = q.trim().toLowerCase();
		const sides = pairSides(pair);
		const tokenSides = [
			{ symbol: pair.token0_symbol, address: pair.token0_address },
			{ symbol: pair.token1_symbol, address: pair.token1_address }
		];
		const exact = tokenSides.find(
			(side) =>
				side.symbol.toLowerCase() === queryText ||
				(side.address !== '' && side.address.toLowerCase() === queryText)
		);
		const partial =
			exact ??
			tokenSides.find((side) => queryText !== '' && side.symbol.toLowerCase().includes(queryText));
		if (partial) {
			return {
				id: null,
				chainId: watchChainId(),
				pairAddress: pair.pair_address,
				tokenAddress: partial.address || null,
				name: partial.symbol,
				symbol: partial.symbol,
				baseSymbol: sides.symbol,
				quoteSymbol: sides.quoteSymbol
			};
		}
		return {
			id: null,
			chainId: watchChainId(),
			pairAddress: pair.pair_address,
			tokenAddress: null,
			name: `${pair.token0_symbol} / ${pair.token1_symbol}`,
			symbol: `${pair.token0_symbol}/${pair.token1_symbol}`,
			baseSymbol: sides.symbol,
			quoteSymbol: sides.quoteSymbol
		};
	}

	function choosePair(pair: PairResult) {
		pairSidesByAddress.set(pair.pair_address.toLowerCase(), pairSides(pair));
		draftReturnId = 'search-heading';
		draft = draftFromPair(pair, submittedQuery);
		thresholdValues = emptyThresholds();
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		pendingRemove = null;
		removeError = '';
		void focusId('watch-heading');
	}

	function editWatch(watch: SavedWatch) {
		const sides = sidesForSaved(watch);
		draft = {
			id: watch.id,
			chainId: watch.chain_id,
			pairAddress: watch.pair_address,
			tokenAddress: watch.token_address,
			name: watch.name,
			symbol: watch.symbol,
			baseSymbol: sides.symbol,
			quoteSymbol: sides.quoteSymbol
		};
		const next = emptyThresholds();
		for (const field of THRESHOLD_FIELDS) {
			next[field.key] = thresholdInputValue(watch[field.key]);
		}
		thresholdValues = next;
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		pendingRemove = null;
		removeError = '';
		void focusId('watch-heading');
	}

	function closeDraft() {
		const id = draft?.id;
		const returnId = draftReturnId;
		draft = null;
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		if (pendingRemove?.source === 'form') pendingRemove = null;
		void focusId(id ? `watch-${id}` : returnId);
	}

	function watchRanking(row: RankingRow, list: 'fast' | 'slow', index: number) {
		const sides = symbolsFromText(row.name, row.symbol);
		const quote = row.quote_symbol.trim() || sides.quoteSymbol;
		draftReturnId = horseItemId(list, row, index);
		draft = {
			id: null,
			chainId: watchChainId(),
			pairAddress: row.pair_address,
			tokenAddress: row.token_address,
			name: row.name.trim() || pairTitle(row),
			symbol: row.symbol.trim() || sides.symbol,
			baseSymbol: row.symbol.trim() || sides.symbol,
			quoteSymbol: quote
		};
		thresholdValues = emptyThresholds();
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		pendingRemove = null;
		removeError = '';
		void focusId('watch-heading');
	}

	function describedBy(key: ThresholdKey): string {
		const ids = ['alert-limit-hint'];
		if (isDownThreshold(key)) ids.push(`limit-${key}-hint`);
		if (thresholdErrors[key]) ids.push(`limit-${key}-error`);
		return ids.join(' ');
	}

	function setThreshold(key: ThresholdKey, value: string) {
		thresholdValues[key] = value;
		const raw = value.trim();
		const negative = raw.startsWith('-') || (/^-?\d+(\.\d+)?$/.test(raw) && Number(raw) < 0);
		if (negative) {
			thresholdErrors = { ...thresholdErrors, [key]: THRESHOLD_NEGATIVE_MESSAGE };
			return;
		}
		if (!thresholdErrors[key]) return;
		if (raw === '' || (/^\d+(\.\d+)?$/.test(raw) && Number(raw) >= 0)) {
			const next = { ...thresholdErrors };
			delete next[key];
			thresholdErrors = next;
		}
	}

	function rejectMinus(event: KeyboardEvent, key: ThresholdKey) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		if (event.key !== '-' && event.code !== 'Minus' && event.code !== 'NumpadSubtract') return;
		event.preventDefault();
		thresholdErrors = { ...thresholdErrors, [key]: THRESHOLD_NEGATIVE_MESSAGE };
	}

	async function showToast(message: string) {
		if (toastTimer) {
			clearTimeout(toastTimer);
			toastTimer = null;
		}
		if (toastText) {
			toastText = '';
			await tick();
		}
		toastText = message;
		toastTimer = setTimeout(() => {
			toastText = '';
			toastTimer = null;
		}, 5000);
	}

	function resetSearchAfterSave() {
		searchSeq += 1;
		searching = false;
		query = '';
		submittedQuery = '';
		results = null;
		resultTokens = null;
		selectedTokenAddress = null;
		searched = false;
		searchError = '';
		searchStatus = '';
		draft = null;
		thresholdValues = emptyThresholds();
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		if (pendingRemove?.source === 'form') pendingRemove = null;
	}

	async function saveWatch(event: SubmitEvent) {
		event.preventDefault();
		if (!draft) return;
		watchError = '';
		watchStatus = '';
		if (!token) {
			signInError = 'Sign in before you save a watch.';
			await focusId('sign-in-heading');
			return;
		}
		const parsed = parseThresholds(thresholdValues);
		if (!parsed.ok) {
			const next: Partial<Record<ThresholdKey, string>> = {};
			for (const error of parsed.errors) next[error.key] = error.message;
			thresholdErrors = next;
			await focusId(`limit-${parsed.errors[0].key}`);
			return;
		}
		thresholdErrors = {};
		savingWatch = true;
		const editing = draft.id;
		const notice = watchNotice(editing ? 'Updated' : 'Added', draft);
		try {
			const saved = editing
				? await updateWatch(token, editing, parsed.body)
				: await createWatch(token, {
						chain_id: draft.chainId,
						pair_address: draft.pairAddress,
						name: draft.name,
						symbol: draft.symbol,
						...(draft.tokenAddress ? { token_address: draft.tokenAddress } : {}),
						...parsed.body
					});
			const nextWatches = watches
				? [saved, ...watches.filter((item) => item.id !== saved.id)]
				: [saved];
			watches = watchesBySymbol(nextWatches);
			await showToast(notice);
			resetSearchAfterSave();
			await focusId('pair-query');
			await loadWatches();
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (message === PICK_CHAIN_MESSAGE) {
				chainsError = PICK_CHAIN_MESSAGE;
				await focusId('chains-error');
				return;
			}
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			watchError = message;
			await focusId('watch-error');
		} finally {
			savingWatch = false;
		}
	}

	function askRemove(target: PendingRemove) {
		pendingRemove = target;
		removeError = '';
		void focusId('remove-confirm');
	}

	function cancelRemove() {
		const triggerId = pendingRemove?.triggerId ?? '';
		pendingRemove = null;
		removeError = '';
		if (triggerId) void focusId(triggerId);
	}

	async function confirmRemove() {
		if (!pendingRemove) return;
		if (!token) {
			signInError = 'Sign in before you remove a watch.';
			await focusId('sign-in-heading');
			return;
		}
		removing = true;
		removeError = '';
		const target = pendingRemove;
		try {
			await deleteWatch(token, target.id);
			pendingRemove = null;
			if (draft?.id === target.id) draft = null;
			if (watches) watches = watches.filter((item) => item.id !== target.id);
			listStatus = `Removed the watch for ${target.name}.`;
			await loadWatches();
			await focusId('list-status');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			removeError = message;
			await focusId('remove-error');
		} finally {
			removing = false;
		}
	}

	function toggleWatchlist() {
		watchlistOpen = !watchlistOpen;
	}

	async function saveFastSchedule(event: SubmitEvent) {
		event.preventDefault();
		fastSaveError = '';
		fastSaveStatus = '';
		const choice = MOVERS_SEND_OPTIONS.find((item) => item.value === fastEvery);
		if (!choice) {
			fastSaveError = 'Choose a schedule from the list.';
			await focusId('fast-horses-save-error');
			return;
		}
		if (!token || !user) {
			fastSaveError = 'Sign in before you save this schedule.';
			await focusId('fast-horses-save-error');
			return;
		}
		const current = user;
		savingFast = true;
		try {
			const saved = await saveMoversAlertEvery(token, choice.seconds);
			const nextUser = mergeScheduleUser(current, saved.user, saved.record);
			user = nextUser;
			fastEvery = MOVERS_SEND_OPTIONS.some((item) => item.seconds === nextUser.movers_alert_every)
				? String(nextUser.movers_alert_every)
				: '0';
			fastSaveStatus = fastAnnouncement(nextUser.movers_alert_every);
			await focusId('fast-horses-save-status');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			fastSaveError = message;
			await focusId('fast-horses-save-error');
		} finally {
			savingFast = false;
		}
	}

	async function saveSlowSchedule(event: SubmitEvent) {
		event.preventDefault();
		slowSaveError = '';
		slowSaveStatus = '';
		if (!isBoardWindow(boardWindow)) {
			slowSaveError = 'Choose a time frame from the list.';
			await focusId('slow-horses-save-error');
			return;
		}
		const choice = SLOW_HORSE_INTERVALS.find((item) => item.value === slowEvery);
		if (!choice) {
			slowSaveError = 'Choose a schedule from the list.';
			await focusId('slow-horses-save-error');
			return;
		}
		if (!token || !user) {
			slowSaveError = 'Sign in before you save this schedule.';
			await focusId('slow-horses-save-error');
			return;
		}
		const current = user;
		savingSlow = true;
		try {
			const saved = await saveBoardAlert(token, boardWindow, choice.seconds);
			const nextUser = mergeScheduleUser(current, saved.user, saved.record);
			user = nextUser;
			const windowChanged = slowShownWindow !== nextUser.board_alert_window;
			slowEvery = SLOW_HORSE_INTERVALS.some((item) => item.seconds === nextUser.board_alert_every)
				? String(nextUser.board_alert_every)
				: '0';
			boardWindow = nextUser.board_alert_window;
			if (slowOpen && windowChanged) await loadSlow(nextUser.board_alert_window, true);
			slowSaveStatus = slowAnnouncement(nextUser.board_alert_window, nextUser.board_alert_every);
			await focusId('slow-horses-save-status');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			slowSaveError = message;
			await focusId('slow-horses-save-error');
		} finally {
			savingSlow = false;
		}
	}

	onMount(() => {
		void (async () => {
			await start();
			await syncWidget();
		})();
		return () => {
			stopFastRefresh();
			stopSlowRefresh();
			clearWidget();
			if (toastTimer) clearTimeout(toastTimer);
		};
	});
</script>

<svelte:head>
	<title>Blind Bit Boys Price Watch Bot — Blind Bit Boys</title>
	<meta
		name="description"
		content="Watch tokens you choose and send Telegram alerts when price or liquidity moves past your limits."
	/>
</svelte:head>

<div class="learn-shell pw">
	<p class="pw-toast" class:is-dismissed={!toastText} role="status" aria-live="polite" aria-atomic="true">
		{toastText}
	</p>
	<h1>Blind Bit Boys Price Watch Bot</h1>
	<p>
		This page watches PulseChain tokens you choose and sends Telegram alerts when price or liquidity
		moves past the limits you set. The site talks only to the Blind Bit Boys API. It never talks to
		Directus and never shows an RPC address.
	</p>
	<noscript>
		<p>This page needs JavaScript to sign in, search, and save watches.</p>
	</noscript>

	{#if health === 'checking'}
		<p role="status">Checking whether the price watch API is reachable.</p>
	{:else if health === 'down'}
		<p id="health-error" role="alert" tabindex="-1">{API_UNREACHABLE}</p>
	{:else}
		<nav aria-label="On this page">
			<ul>
				{#if user}
					<li><a class="story-link" href="#account">Your account</a></li>
				{:else if !restoring}
					<li><a class="story-link" href="#sign-in">Sign in</a></li>
				{/if}
				<li><a class="story-link" href="#chains">Chains you watch</a></li>
				<li><a class="story-link" href="#find-a-pair">Find a pair</a></li>
				<li>
					<a class="story-link" href="#watches" onclick={() => (watchlistOpen = true)}>Watchlist</a>
				</li>
				<li>
					<a class="story-link" href="#top-performers">Top Performers</a>
				</li>
			</ul>
		</nav>

		{#if restoring && !user}
			<p role="status">Loading your account.</p>
		{:else if user}
			<section id="account" aria-labelledby="account-heading">
				<h2 id="account-heading" tabindex="-1">Your account</h2>
				<p>Signed in with Telegram id {user.telegram_id}.</p>
				{#if accountNote}<p>{accountNote}</p>{/if}
				{#if accountError}
					<p id="account-error" role="alert" tabindex="-1">{accountError}</p>
				{/if}
				<button type="button" onclick={signOut}>Sign out</button>
			</section>
		{:else}
			<section id="sign-in" aria-labelledby="sign-in-heading">
				<h2 id="sign-in-heading" tabindex="-1">Sign in with Telegram</h2>
				<form novalidate onsubmit={submitTelegramId}>
					<div class="field">
						<label for="telegram-id">Telegram id</label>
						<input
							id="telegram-id"
							type="text"
							inputmode="numeric"
							autocomplete="off"
							spellcheck="false"
							value={telegramId}
							aria-describedby="telegram-id-hint"
							aria-invalid={signInError ? 'true' : undefined}
							oninput={(event) => {
								const input = event.currentTarget;
								if (!(input instanceof HTMLInputElement)) return;
								const digits = input.value.replace(/\D/g, '');
								telegramId = digits;
								if (input.value !== digits) input.value = digits;
							}}
						/>
						<p id="telegram-id-hint">Digits only.</p>
					</div>
					{#if signInError}
						<p id="sign-in-error" role="alert" tabindex="-1">{signInError}</p>
					{/if}
					<button type="submit" disabled={signingIn}>Sign in with Telegram id</button>
				</form>
				{#if data.botUsername}
					<p>Or use the Telegram login button. If that button does not appear, use the Telegram id field.</p>
					<div id="telegram-login-widget"></div>
				{/if}
			</section>
		{/if}

		<section id="chains" aria-labelledby="chains-heading">
			<h2 id="chains-heading" tabindex="-1">Chains you watch</h2>
			{#if chainsError}
				<p id="chains-error" role="alert" tabindex="-1">{chainsError}</p>
			{/if}
			{#if currentChain}
				<p>{currentChain.name}, chain {currentChain.chain_id}, is the current chain.</p>
			{/if}
			{#if chainsLoaded && activeChains.length === 0}
				<p>No active chains are available.</p>
			{/if}
			{#if activeChains.length > 0}
				<form novalidate onsubmit={submitChains}>
					<fieldset>
						<legend>Select every chain you want alerts for</legend>
						{#each activeChains as chain (chain.chain_id)}
							<div class="choice">
								<input
									type="checkbox"
									id="chain-{chain.chain_id}"
									checked={selectedChainIds.includes(chain.chain_id)}
									onchange={(event) => {
										const input = event.currentTarget;
										if (!(input instanceof HTMLInputElement)) return;
										toggleChain(chain.chain_id, input.checked);
									}}
								/>
								<label for="chain-{chain.chain_id}">{chain.name}, chain {chain.chain_id}</label>
							</div>
						{/each}
					</fieldset>
					{#each extraSaved as id (id)}
						<p>Chain {id} is saved and is not an active chain, so it is not listed above.</p>
					{/each}
					<p>Save chains stores the checked chains.</p>
					{#if chainsStatus}
						<p id="chains-status" tabindex="-1">{chainsStatus}</p>
					{/if}
					<button type="submit" disabled={savingChains}>Save chains</button>
				</form>
			{/if}
		</section>

		<section id="find-a-pair" aria-labelledby="search-heading">
			<h2 id="search-heading" tabindex="-1">Find a pair</h2>
			<form novalidate onsubmit={submitSearch}>
				<div class="field">
					<label for="pair-query">Token name, symbol, or contract address</label>
					<input
						id="pair-query"
						type="search"
						autocomplete="off"
						spellcheck="false"
						bind:value={query}
					/>
				</div>
				{#if searchError}
					<p id="search-error" role="alert" tabindex="-1">{searchError}</p>
				{/if}
				<button type="submit" disabled={searching}>Search</button>
			</form>
			{#if searchStatus}
				<p id="search-status" tabindex="-1">{searchStatus}</p>
			{/if}
			{#if searched && results}
				{#if results.length === 0 && searchTokens.length === 0}
					<p id="search-empty" tabindex="-1">No tokens or pairs matched.</p>
				{:else}
					<h3 id="tokens-heading" tabindex="-1">Tokens</h3>
					<ul class="plain" aria-labelledby="tokens-heading">
						{#each searchTokens as item (item.address.toLowerCase())}
							<li>
								{#if item.name}
									<p>Name: {item.name}</p>
								{/if}
								<p>Symbol: {item.symbol || 'not available'}</p>
								<p class="wrap">Contract address: {item.address}</p>
								<button
									type="button"
									aria-pressed={tokenFilterPressed(item)}
									onclick={() => showPairsFor(item)}
								>
									Show pairs for this token<span class="sr-only"> {tokenLabel(item)}</span>
								</button>
							</li>
						{/each}
					</ul>
					<h3 id="pairs-heading" tabindex="-1">Pairs</h3>
					<p>Highest liquidity first.</p>
					{#if selectedTokenAddress}
						<p>
							Showing pairs for {selectedToken ? tokenLabel(selectedToken) : selectedTokenAddress}.
						</p>
						<button type="button" onclick={showAllPairs}>Show all pairs</button>
					{/if}
					{#if visiblePairs.length === 0}
						<p>
							{selectedTokenAddress ? 'No pairs include this token.' : 'No pairs matched.'}
						</p>
					{:else}
						<ul class="plain" aria-labelledby="pairs-heading">
							{#each visiblePairs as pair, index (pair.pair_address + ':' + index)}
								<li>
									<p>{pairLabel(pair)}</p>
									<p class="wrap">Pair address: {pair.pair_address}</p>
									<p>DEX: {pair.dex || 'n/a'}</p>
									<p>Price USD: {usdText(pair.price_usd)}</p>
									<p>Liquidity USD: {usdText(pair.liquidity_usd)}</p>
									<button type="button" onclick={() => choosePair(pair)}>
										Watch this pair<span class="sr-only"> {pairLabel(pair)}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				{/if}
			{/if}
		</section>

		{#if draft}
			<section id="watch-form" aria-labelledby="watch-heading">
				<h2 id="watch-heading" tabindex="-1">{draft.name} ({draft.symbol})</h2>
				<form novalidate onsubmit={saveWatch}>
					<div class="field">
						<label for="watch-chain">Chain (read only)</label>
						<input id="watch-chain" type="text" readonly value={chainLabel(draft.chainId)} />
					</div>
					<div class="field">
						<label for="watch-pair">Pair address (read only)</label>
						<input id="watch-pair" type="text" readonly value={draft.pairAddress} />
					</div>
					{#if draft.tokenAddress}
						<div class="field">
							<label for="watch-token">Token address (read only)</label>
							<input id="watch-token" type="text" readonly value={draft.tokenAddress} />
						</div>
					{/if}
					<div class="field">
						<label for="watch-name">Name (read only)</label>
						<input id="watch-name" type="text" readonly value={draft.name} />
					</div>
					<div class="field">
						<label for="watch-symbol">Symbol (read only)</label>
						<input id="watch-symbol" type="text" readonly value={draft.symbol} />
					</div>
					<fieldset>
						<legend>Alert limits</legend>
						<p id="alert-limit-hint">Leave a limit blank to turn that alert off.</p>
						{#each THRESHOLD_FIELDS as field (field.key)}
							<div class="field">
								<label for="limit-{field.key}">{field.label}</label>
								<input
									id="limit-{field.key}"
									type="number"
									inputmode="decimal"
									min="0"
									step="any"
									autocomplete="off"
									aria-describedby={describedBy(field.key)}
									aria-invalid={thresholdErrors[field.key] ? 'true' : undefined}
									value={thresholdValues[field.key]}
									onkeydown={(event) => rejectMinus(event, field.key)}
									oninput={(event) => {
										const input = event.currentTarget;
										if (!(input instanceof HTMLInputElement)) return;
										setThreshold(field.key, input.value);
									}}
								/>
								{#if isDownThreshold(field.key)}
									<p id="limit-{field.key}-hint">{DOWN_THRESHOLD_HINT}</p>
								{/if}
								{#if thresholdErrors[field.key]}
									<p id="limit-{field.key}-error" role="alert">{thresholdErrors[field.key]}</p>
								{/if}
							</div>
						{/each}
					</fieldset>
					{#if watchError}
						<p id="watch-error" role="alert" tabindex="-1">{watchError}</p>
					{/if}
					{#if watchStatus}
						<p id="watch-status" tabindex="-1">{watchStatus}</p>
					{/if}
					<div class="actions">
						{#if draft.id}
							<button type="submit" disabled={savingWatch || removing}>Update watch</button>
						{:else}
							<button type="submit" disabled={savingWatch || removing}>Save watch</button>
						{/if}
						{#if draft.id}
							{#if pendingRemove?.source === 'form' && pendingRemove.id === draft.id}
								<div role="group" aria-labelledby="remove-confirm">
									<p id="remove-confirm" tabindex="-1">Remove the watch for {draft.name}?</p>
									{#if removeError}
										<p id="remove-error" role="alert" tabindex="-1">{removeError}</p>
									{/if}
									<button type="button" disabled={removing} onclick={confirmRemove}>Remove watch</button>
									<button type="button" disabled={removing} onclick={cancelRemove}>Cancel</button>
								</div>
							{:else}
								<button
									type="button"
									id="remove-watch-form"
									onclick={() =>
										draft &&
										askRemove({
											id: draft.id || '',
											name: draft.name,
											source: 'form',
											triggerId: 'remove-watch-form'
										})}
								>
									Remove watch
								</button>
							{/if}
						{/if}
						<button type="button" onclick={closeDraft}>Close watch form</button>
					</div>
				</form>
			</section>
		{/if}

		<section id="watches">
			<h2 id="watches-heading">
				<button
					type="button"
					id="watchlist-button"
					class="disclosure"
					aria-expanded={watchlistOpen}
					aria-controls="watchlist-panel"
					onclick={toggleWatchlist}
				>
					Watchlist
				</button>
			</h2>
			<div
				id="watchlist-panel"
				class="disclosure-panel"
				role="region"
				aria-labelledby="watchlist-button"
				hidden={!watchlistOpen}
			>
				<p>Alphabetical by symbol.</p>
				{#if listStatus}
					<p id="list-status" tabindex="-1">{listStatus}</p>
				{/if}
				{#if watchesError}
					<p id="watches-error" role="alert" tabindex="-1">{watchesError}</p>
				{/if}
				{#if !user}
					<p>Sign in to load your watches.</p>
				{:else if watchesLoading && !watches}
					<p role="status">Loading your watches.</p>
				{:else if watches && watches.length === 0}
					<p id="watches-empty">You have no saved watches yet. Search for a token to add one.</p>
				{:else if watches}
					<ul class="plain">
						{#each watches as watch (watch.id)}
							<li>
								<h3 id="watch-{watch.id}" tabindex="-1">{watch.name} ({watch.symbol})</h3>
								<p>Name: {watch.name}</p>
								<p>Symbol: {watch.symbol}</p>
								<p>Chain: {chainLabel(watch.chain_id)}</p>
								<p class="wrap">Pair: {watch.pair_address}</p>
								{#if !watch.active}<p>This watch is off.</p>{/if}
								{#if setLimits(watch).length === 0}
									<p>No limits are set.</p>
								{:else}
									<ul>
										{#each setLimits(watch) as limit (limit.label)}
											<li>{limit.label}: {limit.value}</li>
										{/each}
									</ul>
								{/if}
								<div class="actions">
									<button type="button" onclick={() => editWatch(watch)}>
										Edit<span class="sr-only"> {watch.name}</span>
									</button>
									{#if pendingRemove?.source === 'list' && pendingRemove.id === watch.id}
										<div role="group" aria-labelledby="remove-confirm">
											<p id="remove-confirm" tabindex="-1">Remove the watch for {watch.name}?</p>
											{#if removeError}
												<p id="remove-error" role="alert" tabindex="-1">{removeError}</p>
											{/if}
											<button type="button" disabled={removing} onclick={confirmRemove}>Remove</button>
											<button type="button" disabled={removing} onclick={cancelRemove}>Cancel</button>
										</div>
									{:else}
										<button
											type="button"
											id="remove-{watch.id}"
											onclick={() =>
												askRemove({
													id: watch.id,
													name: watch.name,
													source: 'list',
													triggerId: `remove-${watch.id}`
												})}
										>
											Remove<span class="sr-only"> {watch.name}</span>
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>

		<section id="top-performers" aria-labelledby="top-performers-heading">
			<h2 id="top-performers-heading">Top Performers</h2>
			<div class="horse-switch" role="group" aria-labelledby="top-performers-heading">
				<button
					type="button"
					id="fast-horses-button"
					class="horse-toggle"
					aria-pressed={fastOpen ? 'true' : 'false'}
					aria-controls={fastOpen ? 'fast-horses-panel' : undefined}
					onclick={toggleFastHorses}
				>
					Fast Horses{#if fastOpen}<span> (selected)</span>{/if}
				</button>
				<button
					type="button"
					id="slow-horses-button"
					class="horse-toggle"
					aria-pressed={slowOpen ? 'true' : 'false'}
					aria-controls={slowOpen ? 'slow-horses-panel' : undefined}
					onclick={toggleSlowHorses}
				>
					Slow Horses{#if slowOpen}<span> (selected)</span>{/if}
				</button>
			</div>

			{#if fastOpen}
			<div
				id="fast-horses-panel"
				class="horse-panel"
				role="region"
				aria-labelledby="fast-horses-heading"
			>
				<h3 id="fast-horses-heading">Fast Horses</h3>
				<p>
					Fast Horses are tokens that move quickly. They go up and down, and a token is often on
					this list for only a short time. Choose how often to send this list to your Telegram.
				</p>
				{#if fastError}
					<p id="fast-horses-error" role="alert" tabindex="-1">{fastError}</p>
				{:else if fastRows === null}
					<p role="status">Loading Fast Horses.</p>
				{:else if fastRows.length === 0}
					<p>No tokens are on this list right now.</p>
				{:else}
					<ol class="horse-list">
						{#each fastRows as row, index (`fast:${row.pair_address || row.id}:${index}`)}
							<li class="wrap">
								<p id={horseItemId('fast', row, index)} tabindex="-1">
									Rank: {row.rank ?? index + 1}
								</p>
								<p>{pairTitle(row)}</p>
								{#if row.name.trim() && row.name.trim() !== pairTitle(row)}
									<p>Name: {row.name.trim()}</p>
								{/if}
								<p>{gainText(row.price_change_pct, '')}</p>
								<p>USD price: {usdText(row.price_usd)}</p>
								<p>USD liquidity: {usdText(row.liquidity_usd)}</p>
								{#if row.pair_address}
									<button type="button" onclick={() => watchRanking(row, 'fast', index)}>
										Watch this pair<span class="sr-only"> {pairTitle(row)}</span>
									</button>
								{/if}
							</li>
						{/each}
					</ol>
				{/if}
				{#if fastUpdated}
					<p role="status" aria-atomic="true">Updated {fastUpdated}.</p>
				{/if}
				{#if user}
					{#if user.movers_alert_last_sent}
						<p>Last sent {sentText(user.movers_alert_last_sent)}.</p>
					{/if}
					<p>{nextDueText(user.movers_alert_last_sent, user.movers_alert_every, 'Fast Horses')}</p>
				{/if}
				<form novalidate onsubmit={saveFastSchedule}>
					<div class="field">
						<label for="fast-horses-every">How often to send Fast Horses on Telegram</label>
						<select id="fast-horses-every" bind:value={fastEvery} aria-describedby="fast-horses-hint">
							{#each MOVERS_SEND_OPTIONS as choice (choice.value)}
								<option value={choice.value}>{choice.label}</option>
							{/each}
						</select>
						<p id="fast-horses-hint">Saving does not send Telegram. The bot sends the list.</p>
					</div>
					{#if fastSaveError}
						<p id="fast-horses-save-error" role="alert" tabindex="-1">{fastSaveError}</p>
					{/if}
					{#if fastSaveStatus}
						<p id="fast-horses-save-status" role="status" tabindex="-1">{fastSaveStatus}</p>
					{/if}
					<button type="submit" disabled={savingFast}>Save</button>
				</form>
			</div>
			{/if}

			{#if slowOpen}
			<div
				id="slow-horses-panel"
				class="horse-panel"
				role="region"
				aria-labelledby="slow-horses-heading"
			>
				<h3 id="slow-horses-heading">Slow Horses</h3>
				<p>
					Slow Horses are tokens that move more slowly and tend to stay on the list longer. Choose
					how far back to look, then choose how often to send that list to your Telegram.
				</p>
				<div class="field">
					<label for="slow-horses-window">Slow Horses time frame</label>
					<select id="slow-horses-window" bind:value={boardWindow} onchange={chooseSlowWindow}>
						{#each BOARD_WINDOW_CHOICES as choice (choice.value)}
							<option value={choice.value}>{choice.label}</option>
						{/each}
					</select>
				</div>
				{#if slowError}
					<p id="slow-horses-error" role="alert" tabindex="-1">{slowError}</p>
				{:else if slowRows === null}
					<p role="status">Loading Slow Horses.</p>
				{:else if slowRows.length === 0}
					<p>No tokens are on this list right now.</p>
				{:else}
					<ol class="horse-list">
						{#each slowRows as row, index (`slow:${row.pair_address || row.id}:${index}`)}
							<li class="wrap">
								<p id={horseItemId('slow', row, index)} tabindex="-1">
									Rank: {row.rank ?? index + 1}
								</p>
								<p>{pairTitle(row)}</p>
								{#if row.name.trim() && row.name.trim() !== pairTitle(row)}
									<p>Name: {row.name.trim()}</p>
								{/if}
								<p>{gainText(row.price_change_pct, `in ${windowLabel(slowShownWindow)}`)}</p>
								<p>USD price: {usdText(row.price_usd)}</p>
								<p>USD liquidity: {usdText(row.liquidity_usd)}</p>
								{#if row.pair_address}
									<button type="button" onclick={() => watchRanking(row, 'slow', index)}>
										Watch this pair<span class="sr-only"> {pairTitle(row)}</span>
									</button>
								{/if}
							</li>
						{/each}
					</ol>
				{/if}
				{#if slowUpdated}
					<p role="status" aria-atomic="true">Updated {slowUpdated}.</p>
				{/if}
				{#if user}
					{#if user.board_alert_last_sent}
						<p>Last sent {sentText(user.board_alert_last_sent)}.</p>
					{/if}
					<p>{nextDueText(user.board_alert_last_sent, user.board_alert_every, 'Slow Horses')}</p>
				{/if}
				<form novalidate onsubmit={saveSlowSchedule}>
					<div class="field">
						<label for="slow-horses-every">How often to send Slow Horses on Telegram</label>
						<select id="slow-horses-every" bind:value={slowEvery} aria-describedby="slow-horses-hint">
							{#each SLOW_HORSE_INTERVALS as choice (choice.value)}
								<option value={choice.value}>{choice.label}</option>
							{/each}
						</select>
						<p id="slow-horses-hint">
							Saving stores this time frame and this schedule. It does not send Telegram, and it
							does not change Fast Horses. The bot sends the list.
						</p>
					</div>
					{#if slowSaveError}
						<p id="slow-horses-save-error" role="alert" tabindex="-1">{slowSaveError}</p>
					{/if}
					{#if slowSaveStatus}
						<p id="slow-horses-save-status" role="status" tabindex="-1">{slowSaveStatus}</p>
					{/if}
					<button type="submit" disabled={savingSlow}>Save</button>
				</form>
			</div>
			{/if}
		</section>
	{/if}

	<nav aria-label="Related pages">
		<ul>
			<li><a class="story-link" href="/tools">Accessible tools</a></li>
			<li><a class="story-link" href="/search">Token search</a></li>
			<li><a class="story-link" href="/instructions">Instructions</a></li>
			<li><a class="story-link" href="/official-links">Official Links</a></li>
		</ul>
	</nav>
</div>

<style>
	.pw h2,
	.pw h3 {
		scroll-margin-top: calc(var(--site-header-offset) + 0.75rem);
	}

	.pw #pair-query {
		scroll-margin-top: calc(var(--site-header-offset) + 6.5rem);
	}

	.pw-toast {
		position: fixed;
		z-index: 40;
		top: calc(var(--site-header-offset) + 0.75rem);
		left: 50%;
		width: min(40rem, calc(100% - 2rem));
		margin: 0;
		padding: 0.85rem 1rem;
		overflow-wrap: anywhere;
		border: 2px solid #d4af37;
		border-radius: 0.375rem;
		background: #111827;
		color: #f3f4f6;
		font-weight: 700;
		line-height: 1.5;
		transform: translateX(-50%);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.45);
		pointer-events: none;
	}

	.pw-toast.is-dismissed {
		position: absolute;
		top: auto;
		left: auto;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		clip-path: inset(50%);
		border: 0;
		white-space: nowrap;
		transform: none;
		box-shadow: none;
	}

	.pw .field {
		margin-top: 1rem;
	}

	.pw label,
	.pw legend {
		font-weight: 700;
	}

	.pw fieldset {
		margin-top: 1.25rem;
		padding: 0.75rem 1rem 1rem;
		border: 1px solid #d4af37;
		border-radius: 0.375rem;
	}

	.pw input[type='text'],
	.pw input[type='search'],
	.pw input[type='number'],
	.pw select {
		display: block;
		width: 100%;
		max-width: 40rem;
		min-height: 2.75rem;
		margin-top: 0.35rem;
		padding: 0.55rem 0.75rem;
		border-radius: 0.375rem;
	}

	.pw .choice {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		margin-top: 0.75rem;
	}

	.pw .choice input {
		width: 1.15rem;
		height: 1.15rem;
		margin-top: 0.35rem;
		flex: 0 0 auto;
	}

	.pw .choice label {
		font-weight: 400;
	}

	.pw button {
		min-height: 2.75rem;
		margin: 1rem 0.75rem 0 0;
		padding: 0.55rem 1.1rem;
		border-radius: 0.375rem;
		font-weight: 700;
		cursor: pointer;
	}

	.pw .actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin-top: 1rem;
	}

	.pw .actions button {
		margin: 0;
	}

	.pw .actions [role='group'] {
		flex: 1 1 100%;
	}

	.pw button:disabled {
		cursor: not-allowed;
	}

	.pw button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.pw .plain {
		padding-left: 1.25rem;
	}

	.pw .wrap {
		overflow-wrap: anywhere;
	}

	.pw #telegram-login-widget {
		margin-top: 0.75rem;
		min-height: 2.75rem;
	}

	.pw h2 .disclosure {
		display: block;
		width: min(100%, 40rem);
		margin: 0;
		text-align: left;
	}

	.pw .disclosure-panel {
		margin-top: 0.75rem;
	}

	.pw .disclosure-panel[hidden] {
		display: none;
	}

	.pw .horse-switch {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.75rem;
	}

	.pw .horse-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-width: 44px;
		min-height: 44px;
		margin: 0;
		border-color: #14120b;
		border-style: dashed;
		border-width: 2px;
		font-weight: 400;
		text-decoration: none;
	}

	.pw .horse-toggle[aria-pressed='true'] {
		border-style: solid;
		border-width: 4px;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	.pw .horse-panel {
		margin-top: 0.75rem;
	}

	.pw .horse-panel[hidden] {
		display: none;
	}

	.pw ol.horse-list {
		list-style: decimal;
		padding-left: 2rem;
	}
</style>
