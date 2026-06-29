import { tags as t } from '@lezer/highlight';
import createTheme, { CreateThemeOptions } from "./patch-theme"

export const defaultSettingsLight: CreateThemeOptions['settings'] = {
	background: 'var(--ts-background, #ffffff00)',
	foreground: 'var(--ts-foreground, #24292e)',
	caret: 'var(--ts-caret, #24292e)',
	selection: 'var(--ts-selection, #BBDFFF)',
	selectionMatch: 'var(--ts-selection-match, #BBDFFF)',
	gutterBackground: 'var(--ts-gutter-background, #fff)',
	gutterForeground: 'var(--ts-gutter-foreground, #6e7781)',
};

export const LightStyle: CreateThemeOptions['styles'] = [
	{ tag: [t.standard(t.tagName), t.tagName], color: 'var(--ts-tag, #116329)' },
	{ tag: [t.comment, t.bracket], color: 'var(--ts-comment, #6a737d)' },
	{ tag: [t.className, t.propertyName], color: 'var(--ts-property, #6f42c1)' },
	{ tag: [t.variableName, t.attributeName, t.number, t.operator], color: 'var(--ts-variable, #005cc5)' },
	{ tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: 'var(--ts-keyword, #d73a49)' },
	{ tag: [t.string, t.meta, t.regexp], color: 'var(--ts-string, #22863A)' },
	{ tag: [t.name, t.quote], color: 'var(--ts-name, #22863a)' },
	{ tag: [t.heading, t.strong], color: 'var(--ts-heading, #24292e)', fontWeight: 'bold' },
	{ tag: [t.emphasis], color: 'var(--ts-heading, #24292e)', fontStyle: 'italic' },
	{ tag: [t.deleted], color: 'var(--ts-deleted, #b31d28)', backgroundColor: 'var(--ts-deleted-bg, #ffeef0)' },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: 'var(--ts-atom, #e36209)' },
	{ tag: [t.url, t.escape, t.regexp, t.link], color: 'var(--ts-link, #22863A)' },
	{ tag: t.link, textDecoration: 'underline' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.invalid, color: 'var(--ts-invalid, #cb2431)' },
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
	background: 'var(--ts-background, #0d111700)',
	foreground: 'var(--ts-foreground, #c9d1d9)',
	caret: 'var(--ts-caret, #c9d1d9)',
	selection: 'var(--ts-selection, #003d73)',
	selectionMatch: 'var(--ts-selection-match, #003d73)',
	lineHighlight: 'var(--ts-line-highlight, #36334280)',
};

export const DarkStyle: CreateThemeOptions['styles'] = [
	{ tag: [t.standard(t.tagName), t.tagName], color: 'var(--ts-tag, #7ee787)' },
	{ tag: [t.comment, t.bracket], color: 'var(--ts-comment, #8b949e)' },
	{ tag: [t.className, t.propertyName], color: 'var(--ts-property, #d2a8ff)' },
	{ tag: [t.variableName, t.attributeName, t.number, t.operator], color: 'var(--ts-variable, #79c0ff)' },
	{ tag: [t.keyword, t.typeName, t.typeOperator, t.typeName], color: 'var(--ts-keyword, #ff7b72)' },
	{ tag: [t.string, t.meta, t.regexp], color: 'var(--ts-string, #FFAB70)' },
	{ tag: [t.name, t.quote], color: 'var(--ts-name, #7ee787)' },
	{ tag: [t.heading, t.strong], color: 'var(--ts-heading, #d2a8ff)', fontWeight: 'bold' },
	{ tag: [t.emphasis], color: 'var(--ts-heading, #d2a8ff)', fontStyle: 'italic' },
	{ tag: [t.deleted], color: 'var(--ts-deleted, #ffdcd7)', backgroundColor: 'var(--ts-deleted-bg, #ffeef0)' },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: 'var(--ts-atom, #ffab70)' },
	{ tag: t.link, textDecoration: 'underline' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{ tag: t.invalid, color: 'var(--ts-invalid, #f97583)' },
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