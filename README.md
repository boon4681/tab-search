<div align='center'>

<h1>Tab-search</h1>

<p>Adapter for frontend and backend to create database search filter</p>

<img src="./refs/banner.png" />

</div>

<br />

    ⚠️ This project is started by boon4681 just for fun.

## Preview

<img src="./refs/preview.gif" />

## Usage

### Svelte, Hono, Drizzle ORM
```svelte
<!-- page.svelte -->
<script lang="ts">
    import { mode } from "mode-watcher";
    import { onMount } from "svelte";
    import "tab-search/codemirror/css";

    onMount(async () => {
        // made it load on client-side
        await import("tab-search/codemirror");
    });
</script>

<tab-search
    src="/api/v3/user/tab"
    theme={$mode} placeholder="Search something..."
    onchange={console.log}
/>
```

```typescript
// main.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Tab } from "tab-search/drizzle"
// drizzle
import * as schema from "$schema"
import db from '$database'

const app = new Hono()
const tab = Tab(schema)


// create user tab
const tab$user = tab.use("USER", schema.USER)

app.get('/tab', async (c) => {
    return c.json(tab$user.codemirrorSchema())
})

app.post('/tab',async (c)=> {
    const query = await c.req.text()
    const where = tab$user.prepare(query)
    const data = await db.query.USER.findMany({
        where
    })
    return c.json(data)
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`http://localhost:${info.port}`)
})
```

## Documentation
The documentation is available on nothing.

## Author

- boon4681