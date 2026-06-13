import { describe, expect, test } from "vitest";
import { SQL } from "drizzle-orm";
import { PgDialect, pgTable, integer } from "drizzle-orm/pg-core";
import { Tab } from "../src/drizzle";
import * as schema from "./drizzle/schema";

const users = Tab(schema).use("user", schema.USER);
const dialect = new PgDialect();

describe("Drizzle prepare", () => {
    test("returns SQL and no error for a valid filter", async () => {
        const [where, error] = await users.prepare("@user.id == 10");

        expect(where).toBeInstanceOf(SQL);
        expect(error).toBeUndefined();
    });

    test("returns a parser error instead of rejecting", async () => {
        const result = users.prepare("@user.id ==");

        await expect(result).resolves.toBeDefined();
        const [where, error] = await result;

        expect(where).toBeUndefined();
        expect(error).toBeInstanceOf(Error);
    });

    test("returns transform errors instead of rejecting", async () => {
        const [where, error] = await users.prepare("@user.id == 'not-a-number'");

        expect(where).toBeUndefined();
        expect(error).toBeInstanceOf(Error);
        expect(error?.message).toContain("Type mismatched");
    });

    test("returns an empty successful result for a blank filter", async () => {
        const [where, error] = await users.prepare("   ");

        expect(where).toBeUndefined();
        expect(error).toBeUndefined();
    });

    test("broad-searches Unicode text across string columns only", async () => {
        const [where, error] = await users.prepare("สวัสดี");

        expect(error).toBeUndefined();
        expect(where).toBeInstanceOf(SQL);

        const query = dialect.sqlToQuery(where!);
        expect(query.params).toContain("%สวัสดี%");
        expect(query.sql).toContain('"email" ilike');
        expect(query.sql).toContain('"name" ilike');
        expect(query.sql).not.toContain('"id" ilike');
        expect(query.sql).not.toContain('"is_suspended" ilike');
        expect(query.sql).not.toContain('"meta" ilike');
        expect(query.sql).not.toContain('"created_at" ilike');
    });

    test("broad-searches a numeric term against numeric columns too", async () => {
        const [where, error] = await users.prepare("42");

        expect(error).toBeUndefined();
        expect(where).toBeInstanceOf(SQL);

        const query = dialect.sqlToQuery(where!);
        // still matches text columns as a substring...
        expect(query.params).toContain("%42%");
        expect(query.sql).toContain('"name" ilike');
        // ...and additionally matches the numeric id column by equality
        expect(query.sql).toContain('"id" =');
        expect(query.params).toContain(42);
    });

    test("returns an error when broad search has no text columns", async () => {
        const metrics = pgTable("metrics", {
            count: integer("count").notNull(),
        });
        const metricsSearch = Tab({ metrics }).use("metrics", metrics);

        const [where, error] = await metricsSearch.prepare("สวัสดี");

        expect(where).toBeUndefined();
        expect(error?.message).toContain("no searchable columns");
    });
});
