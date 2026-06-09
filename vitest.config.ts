import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    plugins: [preact()],
    resolve: {
        alias: {
            "preact-custom-element": "preact-custom-element/dist/preact-custom-element.esm.js",
            "@parser": fileURLToPath(new URL("./src/ohm", import.meta.url)),
        },
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        restoreMocks: true,
        setupFiles: ["tests/setup.ts"],
    },
});
