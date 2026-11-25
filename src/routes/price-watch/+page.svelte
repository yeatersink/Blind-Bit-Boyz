<script lang="ts">
	import { L } from '$lib/i18n/preferences.svelte';

	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { formatCryptoPrice } from '$lib/utils/formatting.svelte';
	import MoverBoard from '$lib/components/price-watch/MoverBoard.svelte';
	import RatioWatchPanel from '$lib/components/price-watch/RatioWatchPanel.svelte';
	import {
		API_UNREACHABLE,
		CURRENT_CHAIN_ID,
		FAST_MOVER_VIEWS,
		PICK_CHAIN_MESSAGE,
		PriceWatchApiError,
		SLOW_MOVER_INTERVALS,
		SLOW_MOVER_VIEWS,
		THRESHOLD_FIELDS,
		THRESHOLD_NEGATIVE_MESSAGE,
		VOLUME_VIEWS,
		checkHealth,
		clearStoredToken,
		createWatch,
		deleteWatch,
		DOWN_THRESHOLD_HINT,
		emptyThresholds,
		getChains,
		getMe,
		getMoverBoard,
		isDownThreshold,
		listWatches,
		mergeScheduleUser,
		parseThresholds,
		publicErrorMessage,
		readStoredToken,
		saveChains,
		saveMoversAlertEvery,
		saveSlowMoverInterval,
		saveVolumeAlertEvery,
		searchPairs,
		thresholdInputValue,
		tokenTitle,
		updateWatch,
		watchDisplay,
		watchesBySymbol,
		type PairResult,
		type PriceWatchChain,
		type PriceWatchUser,
		type RankingRow,
		type RankingWindow,
		type SavedWatch,
		type SearchTokenResult,
		type ThresholdKey
	} from '$lib/priceWatchApi';
	import { MOVERS_SEND_OPTIONS } from '$lib/price-watch-types';
	import {
		DEFAULT_PRICE_SOURCE,
		groupBySource,
		priceSourceLabel,
		sourceForChain,
		sourcesForChain,
		type PriceSourceId
	} from '$lib/price-watch-sources';

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

	let health = $state<Health>('checking');
	let restoring = $state(false);
	let token = $state<string | null>(null);
	let user = $state<PriceWatchUser | null>(null);
	let accountError = $state('');

	let chainCatalog = $state<PriceWatchChain[]>([]);
	let sourceId = $state<PriceSourceId>(DEFAULT_PRICE_SOURCE);
	let pulseSource = $state<PriceSourceId>(DEFAULT_PRICE_SOURCE);
	let chainsLoaded = $state(false);
	let selectedChainIds = $state<string[]>([]);
	let viewingChainId = $state(CURRENT_CHAIN_ID);
	let watchMode = $state<'price' | 'ratio'>('price');
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
	let sourceOpen = $state<Record<string, boolean>>({});
	let draftReturnId = 'search-heading';

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

	type PairSide = {
		address: string;
		symbol: string;
		name: string;
	};

	function pairSide(pair: PairResult, index: 0 | 1): PairSide {
		if (index === 0) {
			return {
				address: pair.token0_address,
				symbol: pair.token0_symbol,
				name: pair.token0_name
			};
		}
		return {
			address: pair.token1_address,
			symbol: pair.token1_symbol,
			name: pair.token1_name
		};
	}

	/** Contract address outranks symbol or name. Equal scores keep chain order. */
	function sideScore(query: string, side: PairSide): number {
		const q = query.trim().toLowerCase();
		if (!q) return 0;
		const address = side.address.trim().toLowerCase();
		const symbol = side.symbol.trim().toLowerCase();
		const name = side.name.trim().toLowerCase();
		if (address && address === q) return 3;
		if ((symbol && symbol === q) || (name && name === q)) return 2;
		if (q.length < 2) return 0;
		if ((symbol && symbol.includes(q)) || (name && name.includes(q))) return 1;
		return 0;
	}

	// Display order only. token0 and token1 stay in the order the API returned.
	function orientPair(pair: PairResult, q: string): { base: PairSide; quote: PairSide } {
		const left = pairSide(pair, 0);
		const right = pairSide(pair, 1);
		if (sideScore(q, right) > sideScore(q, left)) return { base: right, quote: left };
		return { base: left, quote: right };
	}

	function matchedSides(pair: PairResult, q: string): PairSide[] {
		const left = pairSide(pair, 0);
		const right = pairSide(pair, 1);
		const leftScore = sideScore(q, left);
		const rightScore = sideScore(q, right);
		if (leftScore === 0 && rightScore === 0) return [];
		if (rightScore > leftScore) return [right];
		if (leftScore > rightScore) return [left];
		return [left, right];
	}

	function searchedTokens(pairs: PairResult[], apiTokens: SearchToken[], q: string): SearchToken[] {
		const tokens = new Map<string, SearchToken>();
		let matched = false;
		for (const pair of pairsByLiquidity(pairs)) {
			for (const side of matchedSides(pair, q)) {
				matched = true;
				rememberToken(tokens, side.address, side.symbol, side.name);
			}
		}
		if (!matched) {
			if (apiTokens.length > 0) return orderQueryFirst(apiTokens, q);
			return tokensFromResults(pairs, q);
		}
		for (const token of apiTokens) {
			const existing = tokens.get(token.address.trim().toLowerCase());
			if (!existing) continue;
			if (!existing.symbol && token.symbol.trim()) existing.symbol = token.symbol.trim();
			if (!existing.name && token.name.trim()) existing.name = token.name.trim();
		}
		return [...tokens.values()];
	}

	function sideTitle(side: PairSide): string {
		return tokenTitle(side.name, side.symbol) || side.address.trim() || 'Unknown token';
	}

	function sideTicker(side: PairSide): string {
		return side.symbol.trim() || side.address.trim() || 'Unknown token';
	}

	function pairLabel(pair: PairResult): string {
		const { base, quote } = orientPair(pair, submittedQuery);
		return `${sideTitle(base)} / ${sideTitle(quote)}`;
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
		return `${verb} ${watchDisplay(item.name, item.symbol)} on ${chainName(item.chainId)}.`;
	}

	function tokenLabel(item: SearchToken): string {
		return tokenTitle(item.name, item.symbol) || item.address;
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
		if (results) return searchedTokens(results, resultTokens ?? [], submittedQuery);
		if (resultTokens && resultTokens.length > 0) return orderQueryFirst(resultTokens, submittedQuery);
		return [];
	});
	const orderedPairs = $derived(results ? pairsByLiquidity(results) : []);
	const visiblePairs = $derived.by(() => {
		const selected = selectedTokenAddress;
		if (!selected) return orderedPairs;
		return orderedPairs.filter((pair) => pairIncludesToken(pair, selected));
	});
	const selectedToken = $derived.by(() => {
		if (!selectedTokenAddress) return null;
		const key = selectedTokenAddress.toLowerCase();
		return searchTokens.find((item) => item.address.toLowerCase() === key) ?? null;
	});
	const extraSaved = $derived(
		selectedChainIds.filter((id) => !activeChains.some((chain) => chain.chain_id === id))
	);

	function chainLabel(chainId: string): string {
		const chain = chainCatalog.find((item) => item.chain_id === chainId);
		if (chain) return `${chain.name}, chain ${chain.chain_id}`;
		return `Chain ${chainId}`;
	}

	function watchChainId(): string {
		return viewingChainId || CURRENT_CHAIN_ID;
	}

	function usdText(value: string): string {
		if (!value) return 'n/a';
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return 'n/a';
		return formatCryptoPrice(numeric);
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

	async function dropSession() {
		clearStoredToken();
		token = null;
		user = null;
		watches = null;
		selectedChainIds = [];
		accountError = '';
		restoring = false;
		await goto('/price-watch/login?notice=expired', { replaceState: true });
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

	async function watchLists(): Promise<SavedWatch[]> {
		const chain = viewingChainId;
		const requests = [
			listWatches(token ?? '', user?.telegram_id, chain, 'pulsex'),
			listWatches(token ?? '', user?.telegram_id, chain, 'liberty')
		];
		if (chain === '1') requests.push(listWatches(token ?? '', user?.telegram_id, chain, 'uniswap'));
		const lists = await Promise.all(requests);
		return watchesBySymbol(lists.flat());
	}

	async function loadWatches() {
		if (!token) {
			watches = null;
			return;
		}
		watchesError = '';
		watchesLoading = true;
		try {
			watches = await watchLists();
		} catch (error) {
			const message = publicErrorMessage(error, token);
			watches = null;
			if (isLoginError(error)) {
				await dropSession();
				return;
			}
			watchesError = message;
		} finally {
			watchesLoading = false;
		}
	}

	/** Null means the reload failed. An empty array is a successful reload. */
	async function fetchWatchList(): Promise<SavedWatch[] | null> {
		if (!token) return null;
		try {
			return await watchLists();
		} catch {
			return null;
		}
	}

	function listWithSaved(items: SavedWatch[], saved: SavedWatch): SavedWatch[] {
		return watchesBySymbol([saved, ...items.filter((item) => item.id !== saved.id)]);
	}

	function listWithoutWatch(items: SavedWatch[], id: string): SavedWatch[] {
		return watchesBySymbol(items.filter((item) => item.id !== id));
	}

	async function loadAccount() {
		if (!token) return;
		accountError = '';
		try {
			const me = await getMe(token);
			user = me.user;
			selectedChainIds = me.chains.map((chain) => chain.chain_id);
			viewingChainId = selectedChainIds.includes(CURRENT_CHAIN_ID)
				? CURRENT_CHAIN_ID
				: (selectedChainIds[0] ?? CURRENT_CHAIN_ID);
			sourceId = sourceForChain(viewingChainId, sourceId, pulseSource);
			await loadWatches();
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				await dropSession();
				return;
			}
			accountError = message;
		}
	}

	async function start() {
		const stored = readStoredToken();
		if (!stored) {
			health = 'up';
			await goto('/price-watch/login', { replaceState: true });
			return;
		}
		try {
			await checkHealth();
		} catch {
			health = 'down';
			await focusId('health-error');
			return;
		}
		health = 'up';
		restoring = true;
		token = stored;
		await Promise.all([loadChains(), loadAccount()]);
		restoring = false;
		if (!user && !accountError) await goto('/price-watch/login', { replaceState: true });
	}

	async function signOut() {
		clearStoredToken();
		token = null;
		user = null;
		watches = null;
		selectedChainIds = [];
		draft = null;
		pendingRemove = null;
		accountError = '';
		listStatus = '';
		watchStatus = '';
		watchError = '';
		await goto('/price-watch/login');
	}

	function clearPriceWorkspace() {
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

	function chooseMode(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		const next = select.value === 'ratio' ? 'ratio' : 'price';
		if (next === watchMode) return;
		watchMode = next;
		clearPriceWorkspace();
	}

	function chooseChain(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		const next = select.value.trim();
		if (!next || next === viewingChainId) return;
		if (viewingChainId !== '1') pulseSource = sourceId;
		viewingChainId = next;
		sourceId = sourceForChain(next, next === '1' ? 'uniswap' : pulseSource, pulseSource);
		selectedChainIds = [next];
		clearPriceWorkspace();
		watches = [];
		void loadWatches();
	}

	function chooseSource(event: Event) {
		const select = event.currentTarget;
		if (!(select instanceof HTMLSelectElement)) return;
		const next = select.value as PriceSourceId;
		if (!sourcesForChain(watchChainId()).some((item) => item.id === next) || next === sourceId) return;
		sourceId = next;
		if (watchChainId() !== '1') pulseSource = next;
		clearPriceWorkspace();
		watches = [];
		void loadWatches();
	}

	async function saveBoardSchedule(
		seconds: number,
		save: (auth: string, value: number) => Promise<{ user: PriceWatchUser; record: Record<string, unknown> }>
	) {
		if (!token || !user) {
			throw new PriceWatchApiError('Sign in before you save this schedule.', 401);
		}
		const current = user;
		const saved = await save(token, seconds);
		user = mergeScheduleUser(current, saved.user, saved.record);
	}

	async function submitChains(event: SubmitEvent) {
		event.preventDefault();
		chainsError = '';
		chainsStatus = '';
		if (!token) {
			await dropSession();
			return;
		}
		const selected = watchChainId();
		const chainIds = activeChains.some((chain) => chain.chain_id === selected) ? [selected] : [];
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
				await dropSession();
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
			const found = await searchPairs(q, watchChainId(), sourceId);
			if (seq !== searchSeq) return;
			results = found.pairs;
			resultTokens = found.tokens;
			submittedQuery = q;
			searched = true;
			selectedTokenAddress = null;
			if (found.error) searchError = found.error;
			const listedTokens = searchedTokens(found.pairs, found.tokens, q);
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
		const { base, quote } = orientPair(pair, q);
		const watched = matchedSides(pair, q)[0] ?? null;
		const baseText = sideTicker(base);
		const quoteText = sideTicker(quote);
		return {
			id: null,
			chainId: watchChainId(),
			pairAddress: pair.pair_address,
			tokenAddress: watched?.address.trim() ? watched.address.trim() : null,
			name: `${sideTitle(base)} / ${sideTitle(quote)}`,
			symbol: `${baseText}/${quoteText}`,
			baseSymbol: baseText,
			quoteSymbol: quoteText
		};
	}

	function choosePair(pair: PairResult) {
		const next = draftFromPair(pair, submittedQuery);
		pairSidesByAddress.set(pair.pair_address.toLowerCase(), {
			symbol: next.baseSymbol,
			quoteSymbol: next.quoteSymbol
		});
		draftReturnId = 'search-heading';
		draft = next;
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

	function watchRanking(row: RankingRow, returnId: string) {
		const sides = symbolsFromText(row.name, row.symbol);
		const quote = row.quote_symbol.trim() || sides.quoteSymbol;
		const symbol = row.symbol.trim() || sides.symbol;
		const title = symbol && quote ? `${symbol}/${quote}` : row.name.trim() || symbol;
		watchMode = 'price';
		draftReturnId = returnId;
		draft = {
			id: null,
			chainId: watchChainId(),
			pairAddress: row.pair_address,
			tokenAddress: row.token_address,
			name: row.name.trim() || title,
			symbol,
			baseSymbol: symbol,
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
			await dropSession();
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
		const currentWatches = watches ? [...watches] : [];
		try {
			if (editing) {
				const saved = await updateWatch(token, editing, parsed.body);
				const fallback = listWithSaved(currentWatches, saved);
				const fresh = await fetchWatchList();
				watches = fresh ? listWithSaved(fresh, saved) : fallback;
				watchesError = '';
				await tick();
				await showToast(notice);
				resetSearchAfterSave();
				await focusId('pair-query');
			} else {
				const saved = await createWatch(token, {
					chain_id: draft.chainId,
					source: sourceId,
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
			}
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (message === PICK_CHAIN_MESSAGE) {
				chainsError = PICK_CHAIN_MESSAGE;
				await focusId('chains-error');
				return;
			}
			if (isLoginError(error)) {
				await dropSession();
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
			await dropSession();
			return;
		}
		removing = true;
		removeError = '';
		const target = pendingRemove;
		const currentWatches = watches ? [...watches] : [];
		try {
			await deleteWatch(token, target.id);
			const fallback = listWithoutWatch(currentWatches, target.id);
			const fresh = await fetchWatchList();
			watches = fresh ? listWithoutWatch(fresh, target.id) : fallback;
			watchesError = '';
			await tick();
			await showToast(`Removed ${target.name} from the watch list.`);
			pendingRemove = null;
			listStatus = '';
			resetSearchAfterSave();
			await focusId('pair-query');
		} catch (error) {
			const message = publicErrorMessage(error, token);
			if (isLoginError(error)) {
				await dropSession();
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

	onMount(() => {
		void start();
		return () => {
			if (toastTimer) clearTimeout(toastTimer);
		};
	});
</script>

<svelte:head>
	<title>{L("Blind Bit Boys Price Watch Bot — Blind Bit Boys")}</title>
	<meta
		name="description"
		content={L("Watch tokens you choose and send Telegram alerts when price or liquidity moves past your limits.")}
	/>
</svelte:head>

<div class="learn-shell pw">
	<p class="pw-toast" class:is-dismissed={!toastText} role="status" aria-live="polite" aria-atomic="true">{L(toastText)}</p>
	<h1>{L("Blind Bit Boys Price Watch Bot")}</h1>
	<noscript>
		<p>{L("This page needs JavaScript. A login is required before the price watch home is available.")}</p>
	</noscript>

	{#if health === 'checking' || restoring}
		<p role="status">{L("Loading your account.")}</p>
	{:else if health === 'down'}
		<p id="health-error" role="alert" tabindex="-1">{L(API_UNREACHABLE)}</p>
	{:else if !user}
		<p role="status">{L("Returning to the login page.")}</p>
		{#if accountError}
			<p id="account-error" role="alert" tabindex="-1">{L(accountError)}</p>
		{/if}
	{:else}
		<p>{L("Choose a chain and a watch mode. Price Watch follows one pair. Ratio Watch follows two tokens. Top Performers lists fast movers, slow movers, and top volume. The site talks only to the Blind Bit Boys API. It never talks to Directus and never shows an RPC address.")}</p>
		<nav aria-label={L("On this page")}>
			<ul>
				<li><a class="story-link" href="#watch-setup">{L("Watch setup")}</a></li>
				<li><a class="story-link" href="#account">{L("Your account")}</a></li>
				{#if watchMode === 'price'}
					<li><a class="story-link" href="#find-a-pair">{L("Find a pair")}</a></li>
					<li>
						<a class="story-link" href="#watches" onclick={() => (watchlistOpen = true)}>{L("Watchlist")}</a>
					</li>
				{:else}
					<li><a class="story-link" href="#ratio-watch">{L("Ratio Watch")}</a></li>
				{/if}
				<li>
					<a class="story-link" href="#top-performers">{L("Top Performers")}</a>
				</li>
			</ul>
		</nav>

		<section id="watch-setup" aria-labelledby="watch-setup-heading">
			<h2 id="watch-setup-heading" tabindex="-1">{L("Watch setup")}</h2>
			{#if chainsError}
				<p id="chains-error" role="alert" tabindex="-1">{L(chainsError)}</p>
			{/if}
			<div class="field">
				<label for="watch-mode">{L("Watch mode")}</label>
				<select id="watch-mode" value={watchMode} onchange={chooseMode}>
					<option value="price">{L("Price Watch")}</option>
					<option value="ratio">{L("Ratio Watch")}</option>
				</select>
			</div>
			{#if chainsLoaded && activeChains.length === 0}
				<p>{L("No active chains are available.")}</p>
			{/if}
			<form novalidate onsubmit={submitChains}>
				<div class="field">
					<label for="page-chain">{L("Chain")}</label>
					<select id="page-chain" value={watchChainId()} onchange={chooseChain}>
						{#each activeChains as chain (chain.chain_id)}
							<option value={chain.chain_id}>{L("{v0}, chain {v1}", { v0: L(chain.name), v1: L(chain.chain_id) })}</option>
						{/each}
						{#if !activeChains.some((chain) => chain.chain_id === watchChainId())}
							<option value={watchChainId()}>{L(chainLabel(watchChainId()))}</option>
						{/if}
					</select>
				</div>
				<p>{L("This page is {v0}, {v1}.", { v0: L(chainLabel(watchChainId())), v1: L(priceSourceLabel(sourceId)) })}</p>
				<div class="field">
					<label for="page-source">{L("Source")}</label>
					<select id="page-source" value={sourceId} onchange={chooseSource}>
						{#each sourcesForChain(watchChainId()) as item (item.id)}
							<option value={item.id}>{L(item.label)}</option>
						{/each}
					</select>
				</div>
				<p>{L("Pair search, watches, ratios, and Top Performers use {v0}.", { v0: L(priceSourceLabel(sourceId)) })}</p>
				{#each extraSaved as id (id)}
					<p>{L("Chain {v0} is saved and is not an active chain, so it is not in the chain list.", { v0: L(id) })}</p>
				{/each}
				<p>{L("Save chain stores this one chain.")}</p>
				{#if chainsStatus}
					<p id="chains-status" role="status" tabindex="-1">{L(chainsStatus)}</p>
				{/if}
				<button type="submit" disabled={savingChains || activeChains.length === 0}>{L("Save chain")}</button>
			</form>
		</section>

		<section id="account" aria-labelledby="account-heading">
			<h2 id="account-heading" tabindex="-1">{L("Your account")}</h2>
			<p>{L("Signed in with Telegram id {v0}.", { v0: L(user.telegram_id) })}</p>
			{#if accountError}
				<p id="account-error" role="alert" tabindex="-1">{L(accountError)}</p>
			{/if}
			<button type="button" onclick={signOut}>{L("Sign out")}</button>
		</section>

		{#if watchMode === 'price'}
		<section id="find-a-pair" aria-labelledby="search-heading">
			<h2 id="search-heading" tabindex="-1">{L("Find a pair")}</h2>
			<form novalidate onsubmit={submitSearch}>
				<div class="field">
					<label for="pair-query">{L("Token name, symbol, or contract address")}</label>
					<input
						id="pair-query"
						type="search"
						autocomplete="off"
						spellcheck="false"
						bind:value={query}
					/>
				</div>
				{#if searchError}
					<p id="search-error" role="alert" tabindex="-1">{L(searchError)}</p>
				{/if}
				<button type="submit" disabled={searching}>{L("Search")}</button>
			</form>
			{#if searchStatus}
				<p id="search-status" tabindex="-1">{L(searchStatus)}</p>
			{/if}
			{#if searched && results}
				{#if results.length === 0 && searchTokens.length === 0}
					<p id="search-empty" tabindex="-1">{L("No tokens or pairs matched.")}</p>
				{:else}
					<h3 id="tokens-heading" tabindex="-1">{L("Tokens")}</h3>
					<ul class="plain" aria-labelledby="tokens-heading">
						{#each searchTokens as item (item.address.toLowerCase())}
							<li>
								<p>{L(tokenLabel(item))}</p>
								<p>{L("Symbol: {v0}", { v0: L(item.symbol || L("not available")) })}</p>
								<p class="wrap">{L("Contract address: {v0}", { v0: L(item.address) })}</p>
								<button
									type="button"
									aria-pressed={tokenFilterPressed(item)}
									onclick={() => showPairsFor(item)}
								>
									{L("Show pairs for this token")}<span class="sr-only"> {L(tokenLabel(item))}</span>
								</button>
							</li>
						{/each}
					</ul>
					<h3 id="pairs-heading" tabindex="-1">{L("Pairs")}</h3>
					<p>{L("Highest liquidity first.")}</p>
					{#if selectedTokenAddress}
						<p>{L("Showing pairs for {v0}.", { v0: L(selectedToken ? tokenLabel(selectedToken) : selectedTokenAddress) })}</p>
						<button type="button" onclick={showAllPairs}>{L("Show all pairs")}</button>
					{/if}
					{#if visiblePairs.length === 0}
						<p>{L(selectedTokenAddress ? L("No pairs include this token.") : L("No pairs matched."))}</p>
					{:else}
						<ul class="plain" aria-labelledby="pairs-heading">
							{#each visiblePairs as pair, index (pair.pair_address + ':' + index)}
								<li>
									<p>{L(pairLabel(pair))}</p>
									<p class="wrap">{L("Pair address: {v0}", { v0: L(pair.pair_address) })}</p>
									<p>{L("DEX: {v0}", { v0: L(pair.dex || 'n/a') })}</p>
									<p>Price USD: {usdText(pair.price_usd)}</p>
									<p>Liquidity USD: {usdText(pair.liquidity_usd)}</p>
									<button type="button" onclick={() => choosePair(pair)}>
										{L("Watch this pair")}<span class="sr-only"> {L(pairLabel(pair))}</span>
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
				<h2 id="watch-heading" tabindex="-1">{L(watchDisplay(draft.name, draft.symbol))}</h2>
				<form novalidate onsubmit={saveWatch}>
					<div class="field">
						<label for="watch-chain">{L("Chain (read only)")}</label>
						<input id="watch-chain" type="text" readonly value={chainLabel(draft.chainId)} />
					</div>
					<div class="field">
						<label for="watch-pair">{L("Pair address (read only)")}</label>
						<input id="watch-pair" type="text" readonly value={draft.pairAddress} />
					</div>
					{#if draft.tokenAddress}
						<div class="field">
							<label for="watch-token">{L("Token address (read only)")}</label>
							<input id="watch-token" type="text" readonly value={draft.tokenAddress} />
						</div>
					{/if}
					<div class="field">
						<label for="watch-name">{L("Name (read only)")}</label>
						<input id="watch-name" type="text" readonly value={draft.name} />
					</div>
					<div class="field">
						<label for="watch-symbol">{L("Symbol (read only)")}</label>
						<input id="watch-symbol" type="text" readonly value={draft.symbol} />
					</div>
					<fieldset>
						<legend>{L("Alert limits")}</legend>
						<p id="alert-limit-hint">{L("Leave a limit blank to turn that alert off.")}</p>
						{#each THRESHOLD_FIELDS as field (field.key)}
							<div class="field">
								<label for="limit-{field.key}">{L(field.label)}</label>
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
									<p id="limit-{field.key}-hint">{L(DOWN_THRESHOLD_HINT)}</p>
								{/if}
								{#if thresholdErrors[field.key]}
									<p id="limit-{field.key}-error" role="alert">{L(thresholdErrors[field.key])}</p>
								{/if}
							</div>
						{/each}
					</fieldset>
					{#if watchError}
						<p id="watch-error" role="alert" tabindex="-1">{L(watchError)}</p>
					{/if}
					{#if watchStatus}
						<p id="watch-status" tabindex="-1">{L(watchStatus)}</p>
					{/if}
					<div class="actions">
						{#if draft.id}
							<button type="submit" disabled={savingWatch || removing}>{L("Update watch")}</button>
						{:else}
							<button type="submit" disabled={savingWatch || removing}>{L("Save watch")}</button>
						{/if}
						{#if draft.id}
							{#if pendingRemove?.source === 'form' && pendingRemove.id === draft.id}
								<div role="group" aria-labelledby="remove-confirm">
									<p id="remove-confirm" tabindex="-1">{L("Remove the watch for {v0}?", { v0: L(watchDisplay(draft.name, draft.symbol)) })}</p>
									{#if removeError}
										<p id="remove-error" role="alert" tabindex="-1">{L(removeError)}</p>
									{/if}
									<button type="button" disabled={removing} onclick={confirmRemove}>{L("Remove watch")}</button>
									<button type="button" disabled={removing} onclick={cancelRemove}>{L("Cancel")}</button>
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
									{L("Remove watch")}
								</button>
							{/if}
						{/if}
						<button type="button" onclick={closeDraft}>{L("Close watch form")}</button>
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
					{L("Watchlist")}
				</button>
			</h2>
			<div
				id="watchlist-panel"
				class="disclosure-panel"
				role="region"
				aria-labelledby="watchlist-button"
				hidden={!watchlistOpen}
			>
				<p>{L("Alphabetical by symbol, grouped by source. The source selector above is used when you create a watch.")}</p>
				{#if listStatus}
					<p id="list-status" tabindex="-1">{L(listStatus)}</p>
				{/if}
				{#if watchesError}
					<p id="watches-error" role="alert" tabindex="-1">{L(watchesError)}</p>
				{/if}
				{#if !user}
					<p>{L("Sign in to load your watches.")}</p>
				{:else if watchesLoading && !watches}
					<p role="status">{L("Loading your watches.")}</p>
				{:else if watches && watches.length === 0}
					<p id="watches-empty">{L("You have no saved watches yet. Search for a token to add one.")}</p>
				{:else if watches}
					{#each groupBySource(watches) as group (group.id)}
						<section aria-labelledby="source-{group.id}-button">
							<h3>
								<button
									type="button"
									id="source-{group.id}-button"
									class="disclosure"
									aria-expanded={sourceOpen[group.id] ? 'true' : 'false'}
									aria-controls="source-{group.id}-panel"
									onclick={() => (sourceOpen = { ...sourceOpen, [group.id]: !sourceOpen[group.id] })}
								>
									{L(group.label)}
								</button>
							</h3>
							<div
								id="source-{group.id}-panel"
								class="disclosure-panel"
								role="region"
								aria-labelledby="source-{group.id}-button"
								hidden={!sourceOpen[group.id]}
							>
					<ul class="plain">
						{#each group.items as watch (watch.id)}
							<li>
								<h4 id="watch-{watch.id}" tabindex="-1">{L(watchDisplay(watch.name, watch.symbol))}</h4>
								<p>{L("Name: {v0}", { v0: L(watchDisplay(watch.name, watch.symbol)) })}</p>
								<p>{L("Symbol: {v0}", { v0: L(watch.symbol) })}</p>
								<p>{L("Chain: {v0}", { v0: L(chainLabel(watch.chain_id)) })}</p>
								<p>{L("Source: {v0}", { v0: L(priceSourceLabel(watch.source)) })}</p>
								<p class="wrap">{L("Pair: {v0}", { v0: L(watch.pair_address) })}</p>
								{#if !watch.active}<p>{L("This watch is off.")}</p>{/if}
								{#if setLimits(watch).length === 0}
									<p>{L("No limits are set.")}</p>
								{:else}
									<ul>
										{#each setLimits(watch) as limit (limit.label)}
											<li>{L(limit.label)}: {limit.value}</li>
										{/each}
									</ul>
								{/if}
								<div class="actions">
									<button type="button" onclick={() => editWatch(watch)}>
										{L("Edit")}<span class="sr-only"> {L(watchDisplay(watch.name, watch.symbol))}</span>
									</button>
									{#if pendingRemove?.source === 'list' && pendingRemove.id === watch.id}
										<div role="group" aria-labelledby="remove-confirm">
											<p id="remove-confirm" tabindex="-1">{L("Remove the watch for {v0}?", { v0: L(watchDisplay(watch.name, watch.symbol)) })}</p>
											{#if removeError}
												<p id="remove-error" role="alert" tabindex="-1">{L(removeError)}</p>
											{/if}
											<button type="button" disabled={removing} onclick={confirmRemove}>{L("Remove")}</button>
											<button type="button" disabled={removing} onclick={cancelRemove}>{L("Cancel")}</button>
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
											{L("Remove")}<span class="sr-only"> {L(watchDisplay(watch.name, watch.symbol))}</span>
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
							</div>
						</section>
					{/each}
				{/if}
			</div>
		</section>

		{:else if token}
		{#key `${watchChainId()}:${sourceId}`}
			<RatioWatchPanel
				chainId={watchChainId()}
				source={sourceId}
				token={token}
				{chainLabel}
				onUnauthorized={() => void dropSession()}
				onChainRequired={() => {
					chainsError = PICK_CHAIN_MESSAGE;
					void focusId('chains-error');
				}}
			/>
		{/key}
		{/if}

		<section id="top-performers" aria-labelledby="top-performers-heading">
			<h2 id="top-performers-heading">{L("Top Performers")}</h2>
			<p id="top-performers-intro">{L("Fast movers are the short bursts. Slow movers are tokens measured over a longer time. Top volume ranks pairs by traded volume. Open a section, choose one view, and read that view’s top 20. Then choose how often that section may send Telegram notifications, and save that choice. A saved choice applies only to that section.")}</p>
			<MoverBoard
				boardId="fast-movers"
				title={`Fast movers, ${priceSourceLabel(sourceId)}`}
				windows={FAST_MOVER_VIEWS}
				initialWindow="live"
				chainId={watchChainId()}
				source={sourceId}
				loadRows={(window, chain) => getMoverBoard(window as RankingWindow, chain, sourceId)}
				scheduleChoices={MOVERS_SEND_OPTIONS}
				scheduleSeconds={user.movers_alert_every}
				scheduleFallback="0"
				lastSent={user.movers_alert_last_sent}
				scheduleHint="Saving applies only to Fast movers. It does not send Telegram. The bot sends the list."
				scheduleName="Fast movers"
				variant="movers"
				onSaveSchedule={(seconds) => saveBoardSchedule(seconds, saveMoversAlertEvery)}
				onWatch={watchRanking}
				onUnauthorized={() => void dropSession()}
			/>
			<MoverBoard
				boardId="slow-movers"
				title={`Slow movers, ${priceSourceLabel(sourceId)}`}
				windows={SLOW_MOVER_VIEWS}
				initialWindow="slow_24h"
				chainId={watchChainId()}
				source={sourceId}
				loadRows={(window, chain) => getMoverBoard(window as RankingWindow, chain, sourceId)}
				scheduleChoices={SLOW_MOVER_INTERVALS}
				scheduleSeconds={user.board_alert_every}
				scheduleFallback="86400"
				lastSent={user.board_alert_last_sent}
				scheduleHint="Saving applies only to Slow movers. Saving sends a confirmation. The bot sends the list on this schedule."
				scheduleName="Slow movers"
				variant="movers"
				onSaveSchedule={(seconds) => saveBoardSchedule(seconds, saveSlowMoverInterval)}
				onWatch={watchRanking}
				onUnauthorized={() => void dropSession()}
			/>
			<MoverBoard
				boardId="top-volume"
				title={`Top volume, ${priceSourceLabel(sourceId)}`}
				windows={VOLUME_VIEWS}
				initialWindow="volume_1h"
				chainId={watchChainId()}
				source={sourceId}
				loadRows={(window, chain) => getMoverBoard(window as RankingWindow, chain, sourceId)}
				scheduleChoices={MOVERS_SEND_OPTIONS}
				scheduleSeconds={user.volume_alert_every}
				scheduleFallback="0"
				lastSent={user.volume_alert_last_sent}
				scheduleHint="Saving applies only to Top volume. It does not send Telegram. The bot sends the list."
				scheduleName="Top volume"
				variant="volume"
				onSaveSchedule={(seconds) => saveBoardSchedule(seconds, saveVolumeAlertEvery)}
				onWatch={watchRanking}
				onUnauthorized={() => void dropSession()}
			/>
		</section>
	{/if}

	<nav aria-label={L("Related pages")}>
		<ul>
			<li><a class="story-link" href="/tools">{L("Accessible tools")}</a></li>
			<li><a class="story-link" href="/search">{L("Token search")}</a></li>
			<li><a class="story-link" href="/instructions">{L("Instructions")}</a></li>
			<li><a class="story-link" href="/official-links">{L("Official Links")}</a></li>
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

	.pw h2 .disclosure,
	.pw h3 .disclosure {
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
