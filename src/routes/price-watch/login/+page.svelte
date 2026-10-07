<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		API_UNREACHABLE,
		PriceWatchApiError,
		clearStoredToken,
		getMe,
		publicErrorMessage,
		readStoredToken,
		signInWithTelegramWidget,
		storeToken,
		type TelegramWidgetAuth
	} from '$lib/priceWatchApi';

	let { data } = $props();

	let checking = $state(true);
	let sessionNote = $state('');
	let readerOpen = $state(false);
	let chatId = $state('');
	let code = $state('');
	let loginError = $state('');
	let loginStatus = $state('');
	let sending = $state(false);
	let loggingIn = $state(false);
	let createOpen = $state(false);
	let createChatId = $state('');
	let createCode = $state('');
	let createStatus = $state('');
	let createSending = $state(false);
	let creating = $state(false);
	let signingIn = $state(false);
	let blockSubmit = false;
	let widgetCleanup: (() => void) | null = null;

	let expiredNotice = $derived($page.url.searchParams.get('notice') === 'expired');

	async function focusId(id: string) {
		await tick();
		const node = document.getElementById(id);
		if (!(node instanceof HTMLElement)) return;
		node.focus();
		node.scrollIntoView({ block: 'nearest' });
	}

	function showError(message: string) {
		loginError = message;
		loginStatus = '';
		createStatus = '';
		return focusId('login-error');
	}

	function blockEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		blockSubmit = true;
		setTimeout(() => {
			blockSubmit = false;
		}, 0);
	}

	async function finishLogin(token: string) {
		if (!token.trim()) {
			await showError('Sign in did not return an account.');
			return;
		}
		const stored = storeToken(token);
		if (!stored) {
			await showError('This browser did not keep the sign-in.');
			return;
		}
		await goto('/price-watch');
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

	async function postJson(path: string, body: unknown): Promise<unknown> {
		let response: Response;
		try {
			response = await fetch(path, {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
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
		return json;
	}

	function sessionToken(json: unknown): string | null {
		if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
		const token = (json as { token?: unknown }).token;
		if (typeof token !== 'string' || !token.trim()) return null;
		return token;
	}

	async function signInFromWidget(widgetUser: Partial<TelegramWidgetAuth>) {
		if (
			typeof widgetUser.hash !== 'string' ||
			widgetUser.id === undefined ||
			widgetUser.auth_date === undefined
		) {
			await showError('Telegram login did not include a hash.');
			return;
		}
		signingIn = true;
		loginError = '';
		loginStatus = '';
		const widget = {
			id: widgetUser.id,
			hash: widgetUser.hash,
			auth_date: widgetUser.auth_date,
			first_name: widgetUser.first_name,
			last_name: widgetUser.last_name,
			username: widgetUser.username,
			photo_url: widgetUser.photo_url
		};
		try {
			let result: { token: string };
			try {
				result = await signInWithTelegramWidget(widget);
			} catch (error) {
				const message = publicErrorMessage(error, null);
				if (message !== 'TELEGRAM_BOT_TOKEN is not set') throw error;
				const fallback = await postJson('/price-watch/login/widget', widget);
				const token = sessionToken(fallback);
				if (!token) throw new PriceWatchApiError('Sign in did not return an account.', 502);
				result = { token };
			}
			await finishLogin(result.token);
		} catch (error) {
			const message = publicErrorMessage(error, null);
			await showError(
				message === 'TELEGRAM_BOT_TOKEN is not set' ? 'Telegram login was rejected.' : message
			);
		} finally {
			signingIn = false;
		}
	}

	async function openReader() {
		readerOpen = true;
		loginError = '';
		await focusId('login-chat-id');
	}

	function digitsFrom(event: Event): string {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return '';
		const digits = input.value.replace(/\D/g, '');
		if (input.value !== digits) input.value = digits;
		return digits;
	}

	async function sendCodeTo(chat: string, focusCodeId: string, markSent: (status: string) => void) {
		const digits = chat.replace(/\D/g, '');
		if (!/^\d{5,20}$/.test(digits)) {
			await showError('Telegram chat id must be digits only.');
			return digits;
		}
		try {
			await postJson('/price-watch/login/code', { telegram_id: digits });
			markSent('The code was sent to that Telegram chat.');
			await focusId(focusCodeId);
		} catch (error) {
			await showError(publicErrorMessage(error, null));
		}
		return digits;
	}

	function codeProblem(entered: string): string | null {
		if (!entered.trim()) return 'Enter the 6 digit code from Telegram.';
		if (!/^\d{6}$/.test(entered)) return 'That code is wrong or expired.';
		return null;
	}

	async function submitLogin(event: SubmitEvent) {
		event.preventDefault();
		if (blockSubmit) return;
		const intent = event.submitter instanceof HTMLButtonElement ? event.submitter.value : 'login';
		if (intent === 'send') {
			sending = true;
			loginError = '';
			loginStatus = '';
			try {
				const digits = await sendCodeTo(chatId, 'login-code', (status) => {
					loginStatus = status;
				});
				chatId = digits;
			} finally {
				sending = false;
			}
			return;
		}
		const digits = chatId.replace(/\D/g, '');
		const entered = code.trim();
		chatId = digits;
		code = entered;
		if (!/^\d{5,20}$/.test(digits)) {
			await showError('Telegram chat id must be digits only.');
			return;
		}
		const problem = codeProblem(entered);
		if (problem) {
			await showError(problem);
			return;
		}
		loggingIn = true;
		loginError = '';
		loginStatus = '';
		try {
			const json = await postJson('/price-watch/login/account', {
				action: 'login',
				telegram_id: digits,
				code: entered
			});
			const token = sessionToken(json);
			if (!token) throw new PriceWatchApiError('Sign in did not return an account.', 502);
			await finishLogin(token);
		} catch (error) {
			await showError(publicErrorMessage(error, null));
		} finally {
			loggingIn = false;
		}
	}

	async function toggleCreate() {
		createOpen = !createOpen;
		if (!createOpen) return;
		await focusId('create-chat-id');
	}

	async function submitCreate(event: SubmitEvent) {
		event.preventDefault();
		if (blockSubmit) return;
		const intent = event.submitter instanceof HTMLButtonElement ? event.submitter.value : 'create';
		if (intent === 'send') {
			createSending = true;
			loginError = '';
			createStatus = '';
			try {
				const digits = await sendCodeTo(createChatId, 'create-code', (status) => {
					createStatus = status;
				});
				createChatId = digits;
			} finally {
				createSending = false;
			}
			return;
		}
		const digits = createChatId.replace(/\D/g, '');
		const entered = createCode.trim();
		createChatId = digits;
		createCode = entered;
		if (!/^\d{5,20}$/.test(digits)) {
			await showError('Telegram chat id must be digits only.');
			return;
		}
		const problem = codeProblem(entered);
		if (problem) {
			await showError(problem);
			return;
		}
		creating = true;
		loginError = '';
		createStatus = '';
		try {
			const json = await postJson('/price-watch/login/account', {
				action: 'create',
				telegram_id: digits,
				code: entered
			});
			const token = sessionToken(json);
			if (!token) throw new PriceWatchApiError('Sign in did not return an account.', 502);
			await finishLogin(token);
		} catch (error) {
			await showError(publicErrorMessage(error, null));
		} finally {
			creating = false;
		}
	}

	onMount(() => {
		let cancelled = false;
		void (async () => {
			const stored = readStoredToken();
			if (stored) {
				try {
					await getMe(stored);
					if (!cancelled) await goto('/price-watch');
					return;
				} catch (error) {
					if (error instanceof PriceWatchApiError && error.status === 401) clearStoredToken();
					else sessionNote = publicErrorMessage(error, stored);
				}
			}
			if (cancelled) return;
			checking = false;
			await tick();
			if (data.botUsername) mountWidget(data.botUsername);
		})();
		return () => {
			cancelled = true;
			clearWidget();
		};
	});
</script>

<svelte:head>
	<title>Log in — Blind Bit Boys Price Watch Bot</title>
	<meta
		name="description"
		content="Log in to the Blind Bit Boys Price Watch Bot with your Telegram account."
	/>
</svelte:head>

<div class="learn-shell pw">
	<h1>Log in</h1>
	<p>An account is your Telegram identity.</p>
	<p>Notifications cannot arrive until you open the Blind Bit Boys bot and press Start.</p>
	<p>
		The Telegram button is the normal login. Log in with screen reader is the path that does not
		depend on Telegram's widget.
	</p>
	<noscript>
		<p>This page needs JavaScript to sign in.</p>
	</noscript>

	{#if checking}
		<p role="status">Checking your session.</p>
	{/if}
	{#if expiredNotice && !checking}
		<p role="status">Your session ended. Sign in again.</p>
	{/if}
	{#if sessionNote && !checking}
		<p role="status">{sessionNote}</p>
	{/if}

	<p hidden={checking}>
		<button
			type="button"
			aria-expanded={readerOpen ? 'true' : 'false'}
			aria-controls="screen-reader-login"
			onclick={openReader}
		>
			Log in with screen reader
		</button>
	</p>

	<div id="screen-reader-login" hidden={checking || !readerOpen}>
		<p id="reader-start">Open the Blind Bit Boys bot and press Start before you request a code.</p>
		<form id="login-form" novalidate onsubmit={submitLogin} onkeydown={blockEscape}>
			<div class="field">
				<label for="login-chat-id">Telegram chat id</label>
				<input
					id="login-chat-id"
					type="text"
					inputmode="numeric"
					autocomplete="off"
					spellcheck="false"
					value={chatId}
					aria-describedby={loginError ? 'reader-start login-error' : 'reader-start'}
					aria-invalid={loginError ? 'true' : undefined}
					oninput={(event) => {
						chatId = digitsFrom(event);
					}}
				/>
			</div>
			<button type="submit" value="send" disabled={sending}>Send code.</button>
			<div class="field">
				<label for="login-code">6-digit code</label>
				<input
					id="login-code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					spellcheck="false"
					value={code}
					aria-describedby={loginError ? 'login-error' : undefined}
					aria-invalid={loginError ? 'true' : undefined}
					oninput={(event) => {
						code = digitsFrom(event);
					}}
				/>
			</div>
			<button type="submit" value="login" disabled={loggingIn}>Log in.</button>
		</form>
		{#if loginStatus}
			<p id="login-status" role="status" tabindex="-1">{loginStatus}</p>
		{/if}
		<button
			type="button"
			aria-expanded={createOpen ? 'true' : 'false'}
			aria-controls="create-account"
			onclick={toggleCreate}
		>
			Create account
		</button>
		<form
			id="create-account"
			hidden={!createOpen}
			novalidate
			onsubmit={submitCreate}
			onkeydown={blockEscape}
		>
			<div class="field">
				<label for="create-chat-id">Telegram chat id</label>
				<input
					id="create-chat-id"
					type="text"
					inputmode="numeric"
					autocomplete="off"
					spellcheck="false"
					value={createChatId}
					aria-describedby={loginError ? 'login-error' : undefined}
					aria-invalid={loginError ? 'true' : undefined}
					oninput={(event) => {
						createChatId = digitsFrom(event);
					}}
				/>
			</div>
			<button type="submit" value="send" disabled={createSending}>Send code.</button>
			<div class="field">
				<label for="create-code">6-digit code</label>
				<input
					id="create-code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					spellcheck="false"
					value={createCode}
					aria-describedby={loginError ? 'login-error' : undefined}
					aria-invalid={loginError ? 'true' : undefined}
					oninput={(event) => {
						createCode = digitsFrom(event);
					}}
				/>
			</div>
			<button type="submit" value="create" disabled={creating}>Create account</button>
		</form>
		{#if createStatus}
			<p id="create-status" role="status" tabindex="-1">{createStatus}</p>
		{/if}
	</div>

	{#if loginError}
		<p id="login-error" role="alert" tabindex="-1">{loginError}</p>
	{/if}

	<div hidden={checking}>
		<h2>Telegram login</h2>
		{#if data.botUsername}
			<p>{signingIn ? 'Checking the Telegram login.' : 'Use the Telegram button to log in.'}</p>
			<div id="telegram-login-widget"></div>
		{:else}
			<p>The Telegram login button is not available. Use Log in with screen reader.</p>
		{/if}
	</div>
</div>

<style>
	.pw .field {
		margin-top: 1rem;
	}

	.pw label {
		font-weight: 700;
	}

	.pw input[type='text'] {
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

	.pw button:disabled {
		cursor: not-allowed;
	}

	.pw button:focus-visible,
	.pw input:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.pw #telegram-login-widget {
		margin-top: 0.75rem;
		min-height: 2.75rem;
	}

	.pw #login-error,
	.pw #login-status,
	.pw #create-status,
	.pw #reader-start {
		max-width: 40rem;
	}
</style>
