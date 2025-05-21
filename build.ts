import * as esbuild from 'esbuild';
import * as tsup from 'tsup';
import alias from "esbuild-plugin-alias";

const main = async () => {
	await tsup.build({
		entryPoints: ['./src/**/*.{ts,tsx,js,css}'],
		outDir: './dist',
		external: [
			'dizzle-orm',
			'ohm-js',
			'@sinclair/typebox',
			'json-schema-typed'
		],
		watch: ['./src/**/*.{ts,tsx,js,css}'],
		splitting: true,
		dts: true,
		clean: true,
		treeshake: true,
		format: ['cjs', 'esm'],
		outExtension: (ctx) => {
			if (ctx.format === 'cjs') {
				return {
					dts: '.d.ts',
					js: '.js',
				};
			}
			return {
				dts: '.d.mts',
				js: '.mjs',
			};
		},
	});
};

main().catch((e) => {
	console.error(e);
});