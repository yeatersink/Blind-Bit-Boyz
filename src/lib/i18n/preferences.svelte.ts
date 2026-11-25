import { browser } from '$app/environment';
import en from './messages/en.json';
import { UI_KEYS } from './ui-keys';

export const LOCALES = [
	{ id: 'en', native: 'English', dir: 'ltr' },
	{ id: 'zh-Hans', native: '中文', dir: 'ltr' },
	{ id: 'hi', native: 'हिन्दी', dir: 'ltr' },
	{ id: 'es', native: 'Español', dir: 'ltr' },
	{ id: 'fr', native: 'Français', dir: 'ltr' },
	{ id: 'ar', native: 'العربية', dir: 'rtl' },
	{ id: 'bn', native: 'বাংলা', dir: 'ltr' },
	{ id: 'pt', native: 'Português', dir: 'ltr' },
	{ id: 'ru', native: 'Русский', dir: 'ltr' },
	{ id: 'ja', native: '日本語', dir: 'ltr' },
	{ id: 'de', native: 'Deutsch', dir: 'ltr' },
	{ id: 'ko', native: '한국어', dir: 'ltr' },
	{ id: 'it', native: 'Italiano', dir: 'ltr' },
	{ id: 'tr', native: 'Türkçe', dir: 'ltr' },
	{ id: 'vi', native: 'Tiếng Việt', dir: 'ltr' },
	{ id: 'pl', native: 'Polski', dir: 'ltr' },
	{ id: 'uk', native: 'Українська', dir: 'ltr' },
	{ id: 'nl', native: 'Nederlands', dir: 'ltr' },
	{ id: 'he', native: 'עברית', dir: 'rtl' },
	{ id: 'id', native: 'Bahasa Indonesia', dir: 'ltr' }
] as const;

export type LocaleId = (typeof LOCALES)[number]['id'];
export type TextSize = 'small' | 'normal' | 'large' | 'xlarge';

export const TEXT_SIZES: { id: TextSize; key: string }[] = [
	{ id: 'small', key: 'a11y.small' },
	{ id: 'normal', key: 'a11y.normal' },
	{ id: 'large', key: 'a11y.large' },
	{ id: 'xlarge', key: 'a11y.xlarge' }
];

const LANG_KEY = 'bbb_locale';
const SIZE_KEY = 'bbb_text_size';
const INVERT_KEY = 'bbb_invert';

const catalogs: Record<string, Record<string, string>> = { en };

const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
	'zh-Hans': () => import('./messages/zh-Hans.json'),
	hi: () => import('./messages/hi.json'),
	es: () => import('./messages/es.json'),
	fr: () => import('./messages/fr.json'),
	ar: () => import('./messages/ar.json'),
	bn: () => import('./messages/bn.json'),
	pt: () => import('./messages/pt.json'),
	ru: () => import('./messages/ru.json'),
	ja: () => import('./messages/ja.json'),
	de: () => import('./messages/de.json'),
	ko: () => import('./messages/ko.json'),
	it: () => import('./messages/it.json'),
	tr: () => import('./messages/tr.json'),
	vi: () => import('./messages/vi.json'),
	pl: () => import('./messages/pl.json'),
	uk: () => import('./messages/uk.json'),
	nl: () => import('./messages/nl.json'),
	he: () => import('./messages/he.json'),
	id: () => import('./messages/id.json')
};

export function isLocale(value: string | null): value is LocaleId {
	return LOCALES.some((item) => item.id === value);
}

export function isTextSize(value: string | null): value is TextSize {
	return value === 'small' || value === 'normal' || value === 'large' || value === 'xlarge';
}

export function localeDir(id: string): 'rtl' | 'ltr' {
	return LOCALES.find((item) => item.id === id)?.dir ?? 'ltr';
}

export function localeNative(id: string): string {
	return LOCALES.find((item) => item.id === id)?.native ?? 'English';
}

let locale = $state<LocaleId>('en');
let textSize = $state<TextSize>('normal');
let inverted = $state(false);
let booted = false;

export function getLocale(): LocaleId {
	return locale;
}

export function getTextSize(): TextSize {
	return textSize;
}

export function getInverted(): boolean {
	return inverted;
}

export function chapterText(id: string, part: 'label' | 'title'): string {
	const number = id.replace(/\D/g, '').replace(/^0+/, '') || '0';
	return t(`ch.${number}.${part}`);
}

export function t(key: string, vars?: Record<string, string>): string {
	const table = catalogs[locale] ?? en;
	let text = table[key] ?? en[key as keyof typeof en] ?? key;
	if (vars) {
		for (const [name, value] of Object.entries(vars)) {
			text = text.replaceAll(`{${name}}`, value);
		}
	}
	return text;
}

function fill(template: string, vars?: Record<string, string | number>): string {
	if (!vars) return template;
	let text = template;
	for (const [name, value] of Object.entries(vars)) {
		text = text.replaceAll(`{${name}}`, String(value));
	}
	return text;
}

const WRAP = /^(.+?) \(([^)]+)\)$/;

/** Translate a user-facing English string. Unknown text is returned unchanged. */
export function L(text: unknown, vars?: Record<string, string | number>): string {
	const source = text == null ? '' : String(text);
	if (!source) return '';
	const key = UI_KEYS[source];
	if (key) return t(key, vars ? Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, String(v)])) : undefined);
	if (!vars) {
		const fast = source.match(/^Fast movers, (.+)$/);
		if (fast) return t('ui.fast-movers-source', { source: L(fast[1]) });
		const slow = source.match(/^Slow movers, (.+)$/);
		if (slow) return t('ui.slow-movers-source', { source: L(slow[1]) });
		const volume = source.match(/^Top volume, (.+)$/);
		if (volume) return t('ui.top-volume-source', { source: L(volume[1]) });
		const chainOnly = source.match(/^Chain (\d+)$/);
		if (chainOnly) return t('ui.chain-id', { id: chainOnly[1] });
		const namedChain = source.match(/^(.+), chain (.+)$/);
		if (namedChain) return t('ui.name-chain-id', { name: L(namedChain[1]), id: namedChain[2] });
		const days = source.match(/^(\d+) days$/);
		if (days) return t('ui.n-days', { n: days[1] });
		const dated = source.match(/^(.+) \((\d+) days\)$/);
		if (dated) return t('ui.date-days', { date: dated[1], n: dated[2] });
		const count = source.match(/^(\d+) (minute|hour|day|month|year)$/);
		if (count) return t(`ui.n-${count[2]}`, { n: count[1] });
		const hyphenCount = source.match(/^(\d+)-(minute|hour|day|month|year)$/);
		if (hyphenCount) return t(`ui.n-${hyphenCount[2]}-hyphen`, { n: hyphenCount[1] });
		const candles = source.match(/^Loaded (\d+) candles from (.+) to (.+)\.$/);
		if (candles) return t('ui.loaded-n-candles', { n: candles[1], start: candles[2], end: candles[3] });
		const groups = source.match(/^Showing (.+) groups built from (.+) candles\.$/);
		if (groups) return t('ui.showing-groups', { group: L(groups[1]), base: L(groups[2]) });
		const dataSource = source.match(/^Data source (.+)\.$/);
		if (dataSource) return t('ui.data-source', { source: L(dataSource[1]) });
		const missingVenue = source.match(/^(.+) is not on (Gecko Terminal|Moralis)\.$/);
		if (missingVenue) return t('ui.label-not-on-where', { label: L(missingVenue[1]), where: L(missingVenue[2]) });
		const unavailableFor = source.match(/^The (.+) for (.+) is not available\.$/);
		if (unavailableFor) return t('ui.the-kind-for-pair-unavailable', { kind: L(unavailableFor[1]), pair: unavailableFor[2] });
		const copiedFor = source.match(/^Copied the (.+) for (.+)\.$/);
		if (copiedFor) return t('ui.copied-kind-for-pair', { kind: L(copiedFor[1]), pair: copiedFor[2] });
		const copyFailed = source.match(/^Could not copy the (.+) for (.+)\. It is still shown on the page\.$/);
		if (copyFailed) return t('ui.could-not-copy-kind', { kind: L(copyFailed[1]), pair: copyFailed[2] });
		const loadedSides = source.match(/^Loaded (.+) and (.+) from that pair\.$/);
		if (loadedSides) return t('ui.loaded-sides-from-pair', { base: loadedSides[1], quote: loadedSides[2] });
		const lastChart = source.match(/^(.+) Showing the last chart\.$/);
		if (lastChart) return t('ui.message-showing-last', { message: L(lastChart[1]) });
		const wrapped = source.match(WRAP);
		if (wrapped && UI_KEYS[wrapped[1]] && wrapped[1] !== source) {
			return `${L(wrapped[1])} (${wrapped[2]})`;
		}
		if (source.includes('. ')) {
			const parts = source.split(/(?<=\.)\s+/);
			if (parts.length > 1) {
				const translated = parts.map((part) => L(part));
				if (translated.some((part, index) => part !== parts[index])) return translated.join(' ');
			}
		}
	}
	return fill(source, vars);
}

function apply() {
	if (!browser) return;
	const root = document.documentElement;
	root.lang = locale;
	root.dir = localeDir(locale);
	root.dataset.textSize = textSize;
	root.classList.toggle('bbb-invert', inverted);
}

function persist() {
	if (!browser) return;
	localStorage.setItem(LANG_KEY, locale);
	localStorage.setItem(SIZE_KEY, textSize);
	localStorage.setItem(INVERT_KEY, inverted ? '1' : '0');
}

export async function ensureCatalog(id: LocaleId): Promise<void> {
	if (catalogs[id] || id === 'en') return;
	const load = loaders[id];
	if (!load) return;
	const module = await load();
	catalogs[id] = module.default;
}

export async function setLocale(next: string): Promise<void> {
	if (!isLocale(next) || next === locale) return;
	await ensureCatalog(next);
	locale = next;
	persist();
	apply();
}

export function setTextSize(next: TextSize): void {
	textSize = next;
	persist();
	apply();
}

export function setInverted(next: boolean): void {
	inverted = next;
	persist();
	apply();
}

export async function initPreferences(): Promise<void> {
	if (!browser || booted) return;
	booted = true;
	const storedLang = localStorage.getItem(LANG_KEY);
	const storedSize = localStorage.getItem(SIZE_KEY);
	const storedInvert = localStorage.getItem(INVERT_KEY);
	if (isTextSize(storedSize)) textSize = storedSize;
	inverted = storedInvert === '1';
	if (isLocale(storedLang)) {
		await ensureCatalog(storedLang);
		locale = storedLang;
	}
	apply();
}
