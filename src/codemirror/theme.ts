import { tags as t } from '@lezer/highlight';
import createTheme, { CreateThemeOptions } from "./patch-theme"

export const defaultSettingsLight: CreateThemeOptions['settings'] = {
	background: '#ffffff00',
	foreground: '#24292e',
	selection: '#BBDFFF',
	selectionMatch: '#BBDFFF',
	gutterBackground: '#fff',
	gutterForeground: '#6e7781',
};

export const LightStyle: CreateThemeOptions['styles'] = [
	{ tag: [t.standard(t.tagName), t.tagName], color: '#116329' },
	{ tag: [t.comment, t.bracket], color: '#6a737d' },
	{ tag: [t.className, t.propertyName], color: '#6f42c1' },
	{ tag: [t.variableName, t.attributeName, t.number, t.operator], color: '#005cc5' },
	{ tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: '#d73a49' },
	{ tag: [t.string, t.meta, t.regexp], color: '#22863A' },
	{ tag: [t.name, t.quote], color: '#22863a' },
	{ tag: [t.heading, t.strong], color: '#24292e', fontWeight: 'bold' },
	{ tag: [t.emphasis], color: '#24292e', fontStyle: 'italic' },
	{ tag: [t.deleted], color: '#b31d28', backgroundColor: 'ffeef0' },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: '#e36209' },
	{ tag: [t.url, t.escape, t.regexp, t.link], color: '#22863A' },
	{ tag: t.link, textDecoration: 'underline' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.invalid, color: '#cb2431' },
];

export const LightInit = (options?: Partial<CreateThemeOptions>) => {
	const { theme = 'light', settings = {}, styles = [] } = options || {};
	return createTheme({
		theme: theme,
		settings: {
			...defaultSettingsLight,
			...settings,
		},
		styles: [...LightStyle, ...styles],
	});
};

export const LightTheme = LightInit();

export const defaultSettingsDark: CreateThemeOptions['settings'] = {
	background: '#0d111700',
	foreground: '#c9d1d9',
	caret: '#c9d1d9',
	selection: '#003d73',
	selectionMatch: '#003d73',
	lineHighlight: '#36334280',
};

export const DarkStyle: CreateThemeOptions['styles'] = [
	{ tag: [t.standard(t.tagName), t.tagName], color: '#7ee787' },
	{ tag: [t.comment, t.bracket], color: '#8b949e' },
	{ tag: [t.className, t.propertyName], color: '#d2a8ff' },
	{ tag: [t.variableName, t.attributeName, t.number, t.operator], color: '#79c0ff' },
	{ tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: '#ff7b72' },
	{ tag: [t.string, t.meta, t.regexp], color: '#FFAB70' },
	{ tag: [t.name, t.quote], color: '#7ee787' },
	{ tag: [t.heading, t.strong], color: '#d2a8ff', fontWeight: 'bold' },
	{ tag: [t.emphasis], color: '#d2a8ff', fontStyle: 'italic' },
	{ tag: [t.deleted], color: '#ffdcd7', backgroundColor: 'ffeef0' },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: '#ffab70' },
	{ tag: t.link, textDecoration: 'underline' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.invalid, color: '#f97583' },
];

export const DarkInit = (options?: Partial<CreateThemeOptions>) => {
	const { theme = 'dark', settings = {}, styles = [] } = options || {};
	return createTheme({
		theme: theme,
		settings: {
			...defaultSettingsDark,
			...settings,
		},
		styles: [...DarkStyle, ...styles],
	});
};

export const DarkTheme = DarkInit();