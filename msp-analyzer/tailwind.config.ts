import type { Config } from 'tailwindcss';
import { de } from 'vuetify/locale';
// Esempio di importazione di un plugin
// const typography = require('@tailwindcss/typography'); 

const config: Config = {
	content: [
		'./app/**/*.{vue,js,ts}',
	],
	theme: {
		extend: {
		fontFamily: {
			killos: ['Killos', 'sans-serif'],
		},
		colors: {
			primary: '#AA77B6',
			secondary: '#ffb703',
			debug: '#e59b46',
		},
		},
	},
	// safelist: [
	// 	'text-sm/7',
	// 	'font-killos',
	// 	'font-scoreboard',
	// 	'font-dynapuff'
	// ],
}
export default config;
