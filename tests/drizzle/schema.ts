import { bigint, boolean, customType, date, integer, intersect, json, jsonb, pgTable, primaryKey, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const USER = pgTable('user', {
    id: serial('id').primaryKey(),
    provider: text('provider', { enum: ['google', 'user-pwd'] }).default('user-pwd').notNull(),
    email: text('email'),
    name: text('name'),
    username: text('username'),
    password: text('password'),
    avatar: text('avatar'),
    is_suspended: boolean('is_suspended').default(false).notNull(),
    meta: jsonb('meta'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
    updated_by: text('updated_by').notNull(),
    created_by: text('created_by').notNull(),
    last_login: timestamp('last_login', { withTimezone: true }).defaultNow().notNull()
})
