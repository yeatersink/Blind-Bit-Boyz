import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				gold: {
					50: '#dfb13a',
					100: '#f4c140',
					200: '#ffd145',
					300: '#ffe14a',
					400: '#fff250',
					500: '#CBA135', // Base gold
					600: '#b79130',
					700: '#a2812a',
					800: '#8e7125',
					900: '#7a6120'
				}
			}
		}
	},

	plugins: []
} satisfies Config;
