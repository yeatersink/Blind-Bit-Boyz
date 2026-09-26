<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		type CurrencyKey,
		currencyList,
		chartIndicators,
		overlayIndicators,
		oscillatorIndicators,
		type ChartIndicator
	} from '$lib/utils/common.js';
	import type { Candle, ChartDataSource } from '$lib/utils/candles';
	import {
		candleOptionNote,
		candleSizes,
		candleWindowIssue,
		resolveCandlePlan,
		showLastOptions,
		windowForShowLast,
		type CandleGrouping,
		type CandleSizeKey,
		type ShowLastKey
	} from '$lib/utils/timeWindow';
	import { readStoredDataSource, storeDataSource } from '$lib/utils/searchResults';
	import type Highcharts from 'highcharts/highstock';
	import {
		priceChartTypes,
		sonificationInstruments,
		type ActiveIndicator,
		type PriceChartType
	} from '$lib/components/charts/highcharts';
	import Candlestick, { type CandlestickOptions } from '$lib/components/charts/Candlestick.svelte';

	type SonificationOrder = 'sequential' | 'simultaneous';

	const durations = [
		{ value: 3000, label: '3 seconds' },
		{ value: 5000, label: '5 seconds' },
		{ value: 10000, label: '10 seconds' },
		{ value: 20000, label: '20 seconds' },
		{ value: 30000, label: '30 seconds' }
	];

	const initialNow = new Date();
	let currentChartType: PriceChartType = $state('candlestick');
	let candleSize: CandleSizeKey = $state('1h');
	let showLast: ShowLastKey = $state('1d');
	let currentStartDate = $state(
		toDatetimeLocal(new Date(initialNow.getTime() - 24 * 60 * 60 * 1000))
	);
	let currentEndDate = $state(toDatetimeLocal(initialNow));
	let historyNote = $state<string | null>(null);
	let renderedGrouping = $state<CandleGrouping | null>(null);
	let currentCurrency: CurrencyKey = $state('usd');
	let dataSource: ChartDataSource = $state('gecko');
	let checked = $state<string[]>([]);
	let priceInstrument = $state('piano');
	let indicatorInstruments = $state<Record<string, string>>({});
	let muted = $state<string[]>([]);
	const AUDIO_PREFS_KEY = 'chartIndicatorAudio';
	let duration = $state('5000');
	let sonificationOrder: SonificationOrder = $state('sequential');
	let renderedType: PriceChartType | null = $state(null);
	let renderedSource: ChartDataSource | null = $state(null);
	let candles: Candle[] = $state([]);
	let chartOptions: CandlestickOptions | undefined = $state(undefined);
	let statusMessage = $state('Loading chart…');
	let audioStatus = $state('');
	let csvStatus = $state('');
	let indicatorStatus = $state('');
	let audioPlaying = $state(false);
	let chart = $state<Highcharts.Chart | null>(null);
	let chartLoadId = $state(0);
	let requestId = 0;

	interface Props {
		address: string;
		name: string;
		symbol: string;
		createdAt?: string | number | null;
	}

	let { address, name, symbol, createdAt = null }: Props = $props();

	function toDatetimeLocal(date: Date): string {
		const pad = (value: number) => String(value).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	let hasVolume = $derived(candles.some((candle) => Number.isFinite(candle.volume)));
	let activeIndicators = $derived(
		chartIndicators
			.filter((indicator) => checked.includes(indicator.value))
			.filter((indicator) => !indicator.needsVolume || hasVolume)
			.map(
				(indicator): ActiveIndicator => ({
					...indicator,
					instrument: indicatorInstruments[indicator.value] || defaultInstrument(indicator.value),
					muted: muted.includes(indicator.value)
				})
			)
	);
	let volumeAlert = $derived(
		chartIndicators
			.filter(
				(indicator) =>
					checked.includes(indicator.value) &&
					indicator.needsVolume &&
					!hasVolume &&
					candles.length > 0
			)
			.map((indicator) => `${indicator.label} needs volume. This source did not return volume.`)
			.join(' ')
	);

	function defaultInstrument(type: string): string {
		const index = chartIndicators.findIndex((indicator) => indicator.value === type);
		return sonificationInstruments[(index + 1) % sonificationInstruments.length] ?? 'piano';
	}

	function saveAudioPrefs() {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(
			AUDIO_PREFS_KEY,
			JSON.stringify({
				instruments: indicatorInstruments,
				muted,
				checked,
				priceInstrument
			})
		);
	}

	function loadAudioPrefs() {
		if (typeof localStorage === 'undefined') return;
		const raw = localStorage.getItem(AUDIO_PREFS_KEY);
		if (!raw) return;
		try {
			const saved = JSON.parse(raw) as {
				instruments?: Record<string, string>;
				muted?: string[];
				checked?: string[];
				priceInstrument?: string;
			};
			const known = new Set(chartIndicators.map((indicator) => indicator.value));
			indicatorInstruments = Object.fromEntries(
				Object.entries(saved.instruments ?? {}).filter(
					([type, name]) =>
						(type === 'price' || known.has(type)) &&
						sonificationInstruments.includes(name as (typeof sonificationInstruments)[number])
				)
			);
			muted = (saved.muted ?? []).filter((type) => known.has(type));
			checked = (saved.checked ?? []).filter((type) => known.has(type));
			if (
				saved.priceInstrument &&
				sonificationInstruments.includes(
					saved.priceInstrument as (typeof sonificationInstruments)[number]
				)
			) {
				priceInstrument = saved.priceInstrument;
			}
		} catch {
			indicatorInstruments = {};
		}
	}

	function toggleIndicator(indicator: ChartIndicator, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (input.checked) {
			if (indicator.needsVolume && candles.length > 0 && !hasVolume) {
				input.checked = false;
				indicatorStatus = `${indicator.label} needs volume. This source did not return volume.`;
				return;
			}
			checked = [...checked, indicator.value];
			indicatorStatus = `${indicator.label} added.`;
		} else {
			checked = checked.filter((value) => value !== indicator.value);
			indicatorStatus = `${indicator.label} removed.`;
		}
		saveAudioPrefs();
	}

	function setIndicatorInstrument(type: string, event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		indicatorInstruments = { ...indicatorInstruments, [type]: value };
		saveAudioPrefs();
	}

	function toggleMute(type: string, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		muted = input.checked ? [...muted, type] : muted.filter((value) => value !== type);
		saveAudioPrefs();
	}

	function sourceLabel(source: ChartDataSource) {
		return source === 'gecko' ? 'Gecko Terminal' : 'Moralis';
	}

	function persistSource(source: ChartDataSource) {
		dataSource = source;
		if (typeof localStorage !== 'undefined') {
			storeDataSource(source);
		}
		statusMessage = `Data source ${sourceLabel(source)}.`;
	}

	function onSourceChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (value === 'gecko' || value === 'moralis') persistSource(value);
	}

	function chartIsLive(instance: Highcharts.Chart | null): instance is Highcharts.Chart {
		return !!instance?.container?.isConnected && typeof instance.sonify === 'function';
	}

	function stopAudio(announce: boolean) {
		if (chartIsLive(chart) && typeof chart.sonification?.cancel === 'function') {
			chart.sonification.cancel();
		}
		audioPlaying = false;
		if (announce) audioStatus = 'Audio stopped';
	}

	function playAudio() {
		if (!chartIsLive(chart)) {
			audioPlaying = false;
			audioStatus = 'Audio chart is unavailable.';
			return;
		}
		chart.update(
			{
				sonification: {
					enabled: true,
					duration: Number(duration),
					order: sonificationOrder
				}
			} as Highcharts.Options,
			false
		);
		audioPlaying = true;
		audioStatus =
			sonificationOrder === 'sequential'
				? 'Playing all series sequentially.'
				: 'Playing all series simultaneously.';
		chart.sonify(() => {
			audioPlaying = false;
			audioStatus = 'Audio stopped';
		});
	}

	function playSeries(id: string, label: string, instrumentName: string) {
		if (!chartIsLive(chart)) {
			audioStatus = 'Audio chart is unavailable.';
			return;
		}
		const series = chart.get(id) as Highcharts.Series | undefined;
		if (!series || typeof series.sonify !== 'function') {
			audioStatus = `${label} is not on the chart yet.`;
			return;
		}
		chart.update(
			{
				sonification: {
					enabled: true,
					duration: Number(duration),
					order: sonificationOrder
				}
			} as Highcharts.Options,
			false
		);
		audioPlaying = true;
		audioStatus = `Playing ${label} with ${instrumentName}.`;
		series.sonify(() => {
			audioPlaying = false;
			audioStatus = 'Audio stopped';
		});
	}

	function onMenuCsv() {
		csvStatus = 'CSV download started.';
	}

	function onChartTypeChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (!priceChartTypes.some((item) => item.value === value)) return;
		currentChartType = value as PriceChartType;
		if (!chartOptions || candles.length === 0) return;
		stopAudio(false);
		renderedType = currentChartType;
		chartLoadId += 1;
	}

	function applyShowLast(key: string) {
		if (key !== 'beginning' && !candleSizes.some((item) => item.key === key)) return;
		showLast = key as ShowLastKey;
		const endMs = Date.now();
		const window = windowForShowLast(showLast, endMs, createdAt);
		currentEndDate = toDatetimeLocal(new Date(endMs));
		currentStartDate = toDatetimeLocal(new Date(window.startMs));
		historyNote = window.note;
	}

	function onShowLastChange(event: Event) {
		applyShowLast((event.currentTarget as HTMLSelectElement).value);
	}

	function onRangeButton(key: string) {
		applyShowLast(key);
		void generateChart();
	}

	async function generateChart() {
		const startMs = new Date(currentStartDate).getTime();
		const endMs = new Date(currentEndDate).getTime();
		if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
			requestId += 1;
			statusMessage = 'Start or end is not a valid date.';
			return;
		}
		if (endMs <= startMs) {
			requestId += 1;
			statusMessage = 'End must be after Start.';
			return;
		}

		const type = currentChartType;
		const source = dataSource;
		const plan = resolveCandlePlan(candleSize, source);
		if (!plan.ok) {
			requestId += 1;
			statusMessage = plan.message;
			return;
		}
		const windowIssue = candleWindowIssue(plan, source, startMs, endMs);
		if (windowIssue) {
			requestId += 1;
			statusMessage = windowIssue;
			return;
		}
		const grouping = plan.grouping;
		const note = historyNote;

		const id = ++requestId;
		statusMessage = 'Loading chart…';
		const chain = page.url.searchParams.get('chain') || '';
		const params = new URLSearchParams({
			source,
			address,
			interval: plan.interval,
			startMs: String(startMs),
			endMs: String(endMs),
			currency: currentCurrency
		});
		if (chain) params.set('chain', chain);

		let result: Response;
		try {
			result = await fetch(`/api/pair/getCandleStickData?${params}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			});
		} catch {
			if (id !== requestId) return;
			statusMessage = 'Failed to load chart data.';
			return;
		}
		if (id !== requestId) return;

		let payload: { error?: string; candles?: Candle[]; warning?: string } | null = null;
		try {
			payload = await result.json();
		} catch {
			payload = null;
		}
		if (id !== requestId) return;

		if (!result.ok) {
			const message = payload?.error || 'Failed to load chart data.';
			if (result.status === 429 && candles.length > 0) {
				statusMessage = `${message} Showing the last chart.`;
				return;
			}
			stopAudio(audioPlaying);
			candles = [];
			chartOptions = undefined;
			renderedType = null;
			renderedSource = null;
			renderedGrouping = null;
			chartLoadId += 1;
			statusMessage = message;
			return;
		}

		const nextCandles = Array.isArray(payload?.candles) ? payload.candles : [];
		stopAudio(audioPlaying);
		candles = nextCandles;
		renderedType = type;
		renderedSource = source;
		renderedGrouping = grouping;
		chartLoadId += 1;
		if (nextCandles.length > 0) {
			chartOptions = {
				name,
				symbol,
				currency: currentCurrency,
				time: result.headers.get('date') || new Date().toISOString()
			};
		} else {
			chartOptions = undefined;
		}
		const parts = [
			`Loaded ${nextCandles.length} candles from ${currentStartDate} to ${currentEndDate}.`
		];
		if (grouping) parts.push(grouping.sentence);
		if (note) parts.push(note);
		if (payload?.warning) parts.push(payload.warning);
		statusMessage = parts.join(' ');
	}

	onMount(() => {
		dataSource = readStoredDataSource();
		loadAudioPrefs();
		void generateChart();
	});
</script>

<form
	novalidate
	onsubmit={(event) => {
		event.preventDefault();
		void generateChart();
	}}
>
	<h3>Data source</h3>
	<div>
		<label for="data-source">Data source</label>
		<select id="data-source" value={dataSource} onchange={onSourceChange}>
			<option value="gecko">Gecko Terminal</option>
			<option value="moralis">Moralis</option>
		</select>
	</div>
	<div>
		<label for="currency">Currency</label>
		<select id="currency" bind:value={currentCurrency}>
			{#each Object.entries(currencyList) as [key, value]}
				<option value={key}>{value.text}</option>
			{/each}
		</select>
	</div>

	<h3 id="chart-type-heading">Chart type</h3>
	<div>
		<label for="chart-type">Chart type</label>
		<select id="chart-type" value={currentChartType} onchange={onChartTypeChange}>
			{#each priceChartTypes as item}
				<option value={item.value}>{item.label}</option>
			{/each}
		</select>
	</div>

	<p id="chart-window-help">
		Candle size is the width of each bar. Show last is how much history to load. Then press Generate
		Chart.
	</p>
	<h3>Candle size</h3>
	<div>
		<label for="candle-size">Candle size</label>
		<select
			id="candle-size"
			name="candle-size"
			aria-describedby="chart-window-help"
			bind:value={candleSize}
		>
			{#each candleSizes as item}
				{@const note = candleOptionNote(item.key, dataSource)}
				<option value={item.key} disabled={note !== null}>
					{item.label}{note ? ` (${note})` : ''}
				</option>
			{/each}
		</select>
	</div>
	<h3>Show last</h3>
	<div>
		<label for="show-last">Show last</label>
		<select
			id="show-last"
			name="show-last"
			aria-describedby="chart-window-help"
			value={showLast}
			onchange={onShowLastChange}
		>
			{#each showLastOptions as item}
				<option value={item.key}>{item.label}</option>
			{/each}
		</select>
	</div>
	<h3>Date range</h3>
	<div>
		<label for="chart-start">Start date and time</label>
		<input
			id="chart-start"
			name="chart-start"
			type="datetime-local"
			step="60"
			autocomplete="off"
			aria-describedby="chart-window-help"
			bind:value={currentStartDate}
			oninput={() => {
				historyNote = null;
			}}
		/>
	</div>
	<div>
		<label for="chart-end">End date and time</label>
		<input
			id="chart-end"
			name="chart-end"
			type="datetime-local"
			step="60"
			autocomplete="off"
			aria-describedby="chart-window-help"
			bind:value={currentEndDate}
			oninput={() => {
				historyNote = null;
			}}
		/>
	</div>
	<button type="submit">Generate Chart</button>

	<h3 id="indicators-heading">Indicators</h3>
	<p>
		Check indicators to add them. Each can have its own instrument. Tab to Play all or Play price
		only. Arrow keys move in the chart.
	</p>

	<fieldset>
		<legend>Overlays</legend>
		{#each overlayIndicators as indicator}
			<div>
				<input
					type="checkbox"
					id={`indicator-${indicator.value}`}
					checked={checked.includes(indicator.value)}
					onchange={(event) => toggleIndicator(indicator, event)}
				/>
				<label for={`indicator-${indicator.value}`}>{indicator.label}</label>
			</div>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Oscillators</legend>
		{#each oscillatorIndicators as indicator}
			<div>
				<input
					type="checkbox"
					id={`indicator-${indicator.value}`}
					checked={checked.includes(indicator.value)}
					onchange={(event) => toggleIndicator(indicator, event)}
				/>
				<label for={`indicator-${indicator.value}`}>{indicator.label}</label>
			</div>
		{/each}
	</fieldset>

	<h3>Sonification</h3>
	<div>
		<label for="instrument-price">Price instrument</label>
		<select
			id="instrument-price"
			value={priceInstrument}
			onchange={(event) => {
				priceInstrument = (event.currentTarget as HTMLSelectElement).value;
				saveAudioPrefs();
			}}
		>
			{#each sonificationInstruments as name}
				<option value={name}>{name}</option>
			{/each}
		</select>
	</div>
	{#each activeIndicators as indicator}
		<div>
			<label for={`instrument-${indicator.value}`}>{indicator.label} instrument</label>
			<select
				id={`instrument-${indicator.value}`}
				value={indicator.instrument}
				onchange={(event) => setIndicatorInstrument(indicator.value, event)}
			>
				{#each sonificationInstruments as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
			<input
				type="checkbox"
				id={`mute-${indicator.value}`}
				checked={indicator.muted}
				onchange={(event) => toggleMute(indicator.value, event)}
			/>
			<label for={`mute-${indicator.value}`}>Mute {indicator.label}</label>
		</div>
	{/each}
	<div>
		<label for="duration">Duration</label>
		<select id="duration" bind:value={duration}>
			{#each durations as item}
				<option value={String(item.value)}>{item.label}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="sonification-order">Order</label>
		<select id="sonification-order" bind:value={sonificationOrder}>
			<option value="sequential">Sequential</option>
			<option value="simultaneous">Simultaneous</option>
		</select>
	</div>
	<button type="button" disabled={!chartIsLive(chart)} onclick={playAudio}>Play all</button>
	<button type="button" disabled={!chartIsLive(chart)} onclick={() => stopAudio(true)}>
		Stop
	</button>
	<button
		type="button"
		disabled={!chartIsLive(chart)}
		onclick={() => playSeries('price', `${name} price`, priceInstrument)}
	>
		Play price only
	</button>
	{#each activeIndicators as indicator}
		<button
			type="button"
			disabled={!chartIsLive(chart) || indicator.muted}
			onclick={() => playSeries(`ind-${indicator.value}`, indicator.label, indicator.instrument)}
		>
			Play {indicator.label} only
		</button>
	{/each}
</form>

<h3>Chart status</h3>
{#key statusMessage}
	{#if statusMessage}
		<p role="alert">{statusMessage}</p>
	{/if}
{/key}
{#if audioStatus}
	<p aria-live="polite">{audioStatus}</p>
{/if}
{#if csvStatus}
	<p aria-live="polite">{csvStatus}</p>
{/if}
{#if indicatorStatus}
	<p role="alert">{indicatorStatus}</p>
{/if}
{#if volumeAlert}
	<p role="alert">{volumeAlert}</p>
{/if}

<h3>Price chart</h3>
{#key chartLoadId}
	{#if chartOptions && candles.length > 0 && renderedType}
		<Candlestick
			{candles}
			seriesType={renderedType}
			options={chartOptions}
			indicators={activeIndicators}
			{priceInstrument}
			duration={Number(duration)}
			order={sonificationOrder}
			grouping={renderedGrouping}
			onShowLast={onRangeButton}
			onCsvDownload={onMenuCsv}
			bind:chart
		/>
	{:else}
		<p>No data available for the selected parameters.</p>
	{/if}
{/key}

{#if dataSource === 'gecko' || renderedSource === 'gecko'}
	<p>
		<a href="https://www.geckoterminal.com/?utm_source=blind-bit-boyz&utm_medium=referral">
			On-chain data provided by GeckoTerminal
		</a>
	</p>
{/if}
