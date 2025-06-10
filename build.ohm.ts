
import * as fs from "node:fs"

const head = String.raw`
'use strict';
//@ts-ignore
import { makeRecipe } from "ohm-js";
;`

const tail = String.raw`
export default result;`

const pre = fs.readFileSync("./src/ohm/tab-search.ohm-bundle.js", "utf8")
    .replace(String.raw`'use strict';const {makeRecipe}=require('ohm-js');`, '')
    .replace(String.raw`module.exports=result;`,'')
fs.writeFileSync("./src/ohm/tab-search.ohm-bundle.js", head + pre + tail)