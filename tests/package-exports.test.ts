import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);

describe("package exports", () => {
    test("loads the CommonJS entrypoints with require", () => {
        expect(() => require("tab-search")).not.toThrow();
        expect(() => require("tab-search/drizzle")).not.toThrow();
    });

    test("loads the ESM entrypoints with import", async () => {
        await expect(import("tab-search")).resolves.toHaveProperty("parseAST");
        await expect(import("tab-search/drizzle")).resolves.toHaveProperty("Tab");
    });
});
