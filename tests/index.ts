import { SQL } from "drizzle-orm";
import { Tab } from "../src/drizzle";
import * as schema from "./drizzle/schema"
import { createFunctionExtension } from "../src/extension";

const d = Tab(schema).use("USER", schema.USER, {
    extensions: [
        createFunctionExtension("test", (ast) => {
            return 0
        })
    ]
})

const testcases = [
    String.raw`   `,
    String.raw` @user.id == 10`,
    String.raw`@user.id >= 10 and @user.username startwiths 'CSPD'`,
    String.raw`@user.id >= test(10)`,
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
