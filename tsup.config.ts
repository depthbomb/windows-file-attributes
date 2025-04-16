import { defineConfig } from 'tsup';

export default defineConfig(() => ({
	clean: true,
	entry: [
		'src/test.ts',
		'src/index.ts'
	],
	format: ['esm', 'cjs'],
	dts: true,
	minify: 'terser',
	skipNodeModulesBundle: false,
	target: 'esnext',
	tsconfig: './tsconfig.json',
}));
