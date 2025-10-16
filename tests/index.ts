import { SQL } from "drizzle-orm";
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Tab } from "../src/drizzle";
import * as schema from "./drizzle/schema"
import { createFunctionExtension, createStringSuggestionExtension } from "../src/extension";

const d = Tab(schema).use("USER", schema.USER, {
    extensions: [
        createStringSuggestionExtension(["cute"]),
        createFunctionExtension("test", () => {
            return 0
        })
    ]
})

const testcases = [
    String.raw`   `,
    String.raw` @user.id == 10`,
    String.raw`@user.id >= 10 and @user.username startwiths 'CSPD'`,
    String.raw`@user.updated_at >= "2025-05-21"`,
    String.raw`"HI"`
]
for (const test of testcases) {
    try {
        console.log(d.prepare(test))
        console.log(d.codemirrorSchema())
    } catch (error) {
        console.log(error)
        // break
    }
}


const app = new Hono()

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.get('/tab', async (c) => {
    return c.json(await d.codemirrorSchema())
})

const server = serve(
    {
        fetch: app.fetch,
        port: 4090,
    },
    (info) => {
        console.log(`Server is running: http://127.0.0.1:${info.port}`);
    }
);