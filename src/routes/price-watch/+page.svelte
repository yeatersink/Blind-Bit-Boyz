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
		getChains,
		getMe,
		getBestBoard,
		isDownThreshold,
		listWatches,
		parseThresholds,
		publicErrorMessage,
		MESSAGE_TIMER_CHOICES,
		readStoredToken,
		saveBestAlertEvery,
		saveChains,
		searchPairs,
		signInWithTelegramId,
		signInWithTelegramWidget,
		storeToken,
		THRESHOLD_NEGATIVE_MESSAGE,
		thresholdInputValue,
		updateWatch,
		watchesBySymbol,
		type PairResult,
		type PriceWatchChain,
		type SearchTokenResult,
		type RankingRow,
		type PriceWatchUser,
		type SavedWatch,
		type TelegramWidgetAuth,
		type ThresholdKey
	} from '$lib/priceWatchApi';

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

	const BEST_REFRESH_MS = 15_000;

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
	let performanceOpen = $state(false);
	let bestRows = $state<RankingRow[] | null>(null);
	let bestError = $state('');
	let bestUpdated = $state('');
	let copyStatus = $state('');
	let draftReturnId = 'search-heading';
	let bestSeq = 0;
	let bestTimer: ReturnType<typeof setInterval> | null = null;
	let messageInterval = $state('');
	let messageTimerError = $state('');
	let messageTimerStatus = $state('');
	let savingMessageTimer = $state(false);

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

	function changeText(value: number | null): string {
		if (value === null || !Number.isFinite(value)) return 'n/a';
		const amount = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
			Math.abs(value)
		);
		if (value < 0) return `down ${amount}%`;
		if (value > 0) return `up ${amount}%`;
		return '0%';
	}

	function passesLiquidityFloor(row: RankingRow): boolean {
		if (row.meets_liquidity_floor === false) return false;
		if (!row.liquidity_usd.trim()) return row.meets_liquidity_floor !== false;
		const liquidity = Number(row.liquidity_usd);
		if (!Number.isFinite(liquidity)) return false;
		return liquidity >= 1000;
	}

	function rankingHeadingId(row: RankingRow): string {
		const key = (row.pair_address || row.id).replace(/[^a-zA-Z0-9_-]/g, '');
		return `performance-${key || 'row'}`;
	}

	function clockText(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
	}

	function showBestAlert(seconds: number) {
		const value = seconds > 0 ? String(seconds) : '';
		messageInterval = MESSAGE_TIMER_CHOICES.some((item) => item.value === value) ? value : '';
		messageTimerError = '';
	}

	function clearMessageTimerView() {
		messageInterval = '';
		messageTimerError = '';
		messageTimerStatus = '';
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
		clearMessageTimerView();
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

	async function loadBest() {
		const seq = ++bestSeq;
		try {
			const rows = (await getBestBoard()).filter(passesLiquidityFloor);
			if (seq !== bestSeq) return;
			bestRows = rows;
			bestError = '';
			bestUpdated = clockText(new Date());
		} catch {
			if (seq !== bestSeq) return;
			bestError = 'The best performing list could not be loaded.';
		}
	}

	function startBestRefresh() {
		if (bestTimer) clearInterval(bestTimer);
		bestTimer = setInterval(() => {
			void loadBest();
		}, BEST_REFRESH_MS);
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
			user = me.user;
			selectedChainIds = me.chains.map((chain) => chain.chain_id);
			showBestAlert(me.user.best_alert_every);
			await loadWatches();
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
		startBestRefresh();
		await Promise.all([loadChains(), loadBest()]);
		const stored = readStoredToken();
		if (!stored) return;
		restoring = true;
		token = stored;
		await loadAccount();
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
		clearMessageTimerView();
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

	function watchRanking(row: RankingRow) {
		draftReturnId = rankingHeadingId(row);
		draft = {
			id: null,
			chainId: watchChainId(),
			pairAddress: row.pair_address,
			tokenAddress: row.token_address,
			name: row.name,
			symbol: row.symbol,
			baseSymbol: row.symbol,
			quoteSymbol: ''
		};
		thresholdValues = emptyThresholds();
		thresholdErrors = {};
		watchError = '';
		watchStatus = '';
		pendingRemove = null;
		removeError = '';
		void focusId('watch-heading');
	}

	async function copyAddress(value: string, success: string) {
		try {
			await navigator.clipboard.writeText(value);
			copyStatus = success;
		} catch {
			copyStatus = 'Copy failed.';
		}
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

	function togglePerformance() {
		performanceOpen = !performanceOpen;
	}

	async function saveMessageSchedule(event: SubmitEvent) {
		event.preventDefault();
		messageTimerError = '';
		const form = event.currentTarget;
		const select = form instanceof HTMLFormElement ? form.elements.namedItem('message-interval') : null;
		const value = select instanceof HTMLSelectElement ? select.value : messageInterval;
		messageInterval = value;
		const choice = MESSAGE_TIMER_CHOICES.find((item) => item.value === value);
		if (!choice) {
			messageTimerError = 'Choose a schedule from the list.';
			await focusId('message-timer-error');
			return;
		}
		if (!token || !user) {
			messageTimerError = 'Sign in before you save this schedule.';
			await focusId('message-timer-error');
			return;
		}
		const seconds = choice.seconds === null ? 0 : choice.seconds;
		savingMessageTimer = true;
		try {
			const saved = await saveBestAlertEvery(token, seconds);
			user = { ...user, best_alert_every: saved };
			showBestAlert(saved);
			const spoken = choice.label.charAt(0).toLowerCase() + choice.label.slice(1);
			messageTimerStatus =
				saved === 0
					? 'Telegram messages for this list are off.'
					: `Saved. Telegram will send this list ${spoken}.`;
			await focusId('message-timer-status');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				dropSession(message);
				await focusId('sign-in-heading');
				return;
			}
			messageTimerError = message;
			await focusId('message-timer-error');
		} finally {
			savingMessageTimer = false;
		}
	}

	onMount(() => {
		void (async () => {
			await start();
			await syncWidget();
		})();
		return () => {
			if (bestTimer) clearInterval(bestTimer);
			bestTimer = null;
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
					<a class="story-link" href="#performance" onclick={() => (performanceOpen = true)}>
						Best performing
					</a>
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

		<section id="performance">
			<h2 id="performance-heading">
				<button
					type="button"
					id="performance-button"
					class="disclosure"
					aria-expanded={performanceOpen}
					aria-controls="performance-panel"
					onclick={togglePerformance}
				>
					Best performing
				</button>
			</h2>
			<div
				id="performance-panel"
				class="disclosure-panel"
				role="region"
				aria-labelledby="performance-button"
				hidden={!performanceOpen}
			>
				<p>
					The live top 10 on {currentChain ? currentChain.name : `chain ${CURRENT_CHAIN_ID}`}.
					Pools under $1,000 of liquidity are left out.
				</p>
				<p>These results come from a high-speed private RPC. They should be fast and accurate.</p>
				{#if bestError}
					<p id="performance-error" role="alert" tabindex="-1">{bestError}</p>
				{/if}
				{#if bestRows === null && !bestError}
					<p role="status">Loading the best performing pools.</p>
				{:else if bestRows && bestRows.length === 0}
					<p>No pools are on the board yet.</p>
				{:else if bestRows}
					<ul class="plain">
						{#each bestRows as row (row.id)}
							<li class="wrap">
								<h3 id={rankingHeadingId(row)} tabindex="-1">{row.name} ({row.symbol})</h3>
								<p>Rank: {row.rank === null ? 'n/a' : row.rank}</p>
								<p>Name: {row.name}</p>
								<p>Symbol: {row.symbol}</p>
								<p>Price change: {changeText(row.price_change_pct)}</p>
								<p>Price: {usdText(row.price_usd)}</p>
								<p>Liquidity: {usdText(row.liquidity_usd)}</p>
								{#if row.pair_address}
									<p class="wrap">Pair address: {row.pair_address}</p>
									<button
										type="button"
										onclick={() => copyAddress(row.pair_address, 'Pair address copied.')}
									>
										Copy pair address<span class="sr-only">{' '}{row.name}</span>
									</button>
								{/if}
								{#if row.token_address}
									<p class="wrap">Token address: {row.token_address}</p>
									<button
										type="button"
										onclick={() => copyAddress(row.token_address || '', 'Token address copied.')}
									>
										Copy token address<span class="sr-only">{' '}{row.name}</span>
									</button>
								{/if}
								<button type="button" onclick={() => watchRanking(row)}>
									Watch this pair<span class="sr-only">{' '}{row.name}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				{#if bestUpdated}
					<p role="status" aria-atomic="true">Updated {bestUpdated}.</p>
				{/if}
				{#if copyStatus}
					<p id="copy-status" role="status" aria-atomic="true">{copyStatus}</p>
				{/if}
				<form novalidate onsubmit={saveMessageSchedule}>
					<div class="field">
						<label for="performance-message-interval">How often to send this list on Telegram.</label>
						<select
							id="performance-message-interval"
							name="message-interval"
							bind:value={messageInterval}
							aria-describedby="performance-message-hint"
						>
							{#each MESSAGE_TIMER_CHOICES as choice (choice.value)}
								<option value={choice.value}>{choice.label}</option>
							{/each}
						</select>
						<p id="performance-message-hint">
							This timer does not change the 15-second page refresh.
						</p>
					</div>
					{#if messageTimerError}
						<p id="message-timer-error" role="alert" tabindex="-1">{messageTimerError}</p>
					{/if}
					{#if messageTimerStatus}
						<p id="message-timer-status" role="status" tabindex="-1">{messageTimerStatus}</p>
					{/if}
					<button type="submit" disabled={savingMessageTimer}>Save message timer</button>
				</form>
			</div>
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
</style>
