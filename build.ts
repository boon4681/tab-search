import { rmdirSync } from 'node:fs';
import * as tsup from 'tsup';

const main = async () => {
	const watch = process.argv.includes('--watch');

	rmdirSync("./dist", { recursive: true })

	await tsup.build({
		entryPoints: [
			'./src/**/*.{ts,tsx,js,css}',
			'!./src/**/*.test.{ts,tsx,js}',
		],
		outDir: './dist',
		external: [
			'drizzle-orm',
			'ohm-js',
			'@sinclair/typebox',
			'json-schema-typed'
		],
		watch: watch ? ['./src/**/*.{ts,tsx,js,css}'] : false,
		splitting: true,
		dts: true,
		clean: true,
		format: ['cjs', 'esm'],
		outExtension: (ctx) => {
			if (ctx.format === 'cjs') {
				return {
					js: '.cjs',
				};
			}
			return {
				js: '.mjs',
			};
		},
	});
};

main().catch((e) => {
	console.error(e);
});
