import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "_tests/setup.ts",
    },
    resolve: {
		alias: {
			"@": path.resolve(__dirname, './src/'),
			core: `${path.resolve(__dirname, './src/core/')}`,
			features: `${path.resolve(__dirname, './src/features/')}`,
			pages: `${path.resolve(__dirname, './src/pages/')}`,
			assets: `${path.resolve(__dirname, './src/assets/')}`
		}
	},
});
