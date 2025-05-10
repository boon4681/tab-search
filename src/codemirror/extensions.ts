import {
    defaultHighlightStyle,
    syntaxHighlighting,
    bracketMatching,
    StreamLanguage,
    syntaxTree,
} from "@codemirror/language";
import { EditorState, Compartment } from "@codemirror/state";
import { simpleMode } from "@codemirror/legacy-modes/mode/simple-mode";
import { autocompletion, CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { TSchema } from "@sinclair/typebox";
import { type JSONSchema } from "json-schema-typed/draft-07";

function unwrapJSON(def: JSONSchema | undefined) {
    if (typeof def == "boolean") return undefined
    return def
}

class LanguageAutocomplete {
    private tables: Array<{ label: string, type: string, info: string }> = []
    private literals: Array<{ label: string, type: string, info: string }> = [
        { label: "true", type: "boolean", info: "" },
        { label: "false", type: "boolean", info: "" },
        { label: "null", type: "null", info: "" },
    ];
    private operators: Array<{ label: string, type: string, info: string }> = [
        { label: "==", type: "operator", info: "" },
        { label: "!=", type: "operator", info: "" },
        { label: ">=", type: "operator", info: "" },
        { label: "<=", type: "operator", info: "" },
        { label: ">", type: "operator", info: "" },
        { label: "<", type: "operator", info: "" },
        { label: "and", type: "operator", info: "" },
        { label: "or", type: "operator", info: "" },
        { label: "startwiths", type: "operator", info: "" },
        { label: "endwiths", type: "operator", info: "" },
    ];
    constructor(private schema: JSONSchema) {
        this.updateSchema(schema)
    }
    public updateSchema(schema: JSONSchema) {
        this.schema = schema
        this.tables = Object.keys(unwrapJSON(unwrapJSON(this.schema)?.properties?.tables)?.properties ?? []).map(key => {
            return { label: key, type: "keyword", info: "" }
        })
    }
    public getAutocompletion() {
        return autocompletion({
            override: [this.createCompletionSource()],
            icons: false
        })
    }
    private createCompletionSource() {
        return (context: CompletionContext): CompletionResult | null => {
            const before = context.matchBefore(/\"[^\"]+|\'[^\']+/);
            if (before) {
                return null;
            }
            let table = context.matchBefore(/@[\w_]*/);
            if (table) {
                console.log(this.tables)
                return {
                    from: table.from + 1,
                    options: this.tables
                };
            }
            let word = context.matchBefore(/[\w\.\!_]+/);
            if (!word) {
                const before = context.matchBefore(/[\(\)\[\]\{\},;=<>!&|^%\*\+\-\/]+/);
                if (before) {
                    return {
                        from: before.from,
                        options: this.operators.filter(c => c.label.toLowerCase().startsWith(before.text.toLowerCase()))
                    };
                }
                const dot = context.matchBefore(/@[\w\.\!_]+/);
                if (dot && dot.text.includes('.')) {
                    return this.handlePropertyAccess(dot.text, dot.from);
                }
                return null;
            }
            if (word.text.includes('.')) {
                return this.handlePropertyAccess(word.text, word.from);
            }
            const tables = this.tables.filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase()))
            const options = [
                ...this.operators,
                ...this.literals,
            ].filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase()))
            return {
                from: word.from,
                options: [...tables, ...options]
            };
        };
    }
    private handlePropertyAccess(text: string, from: number): CompletionResult | null {
        const parts = text.split('.');
        const currentFragment = parts[parts.length - 1];
        const parentPath = parts.slice(0, parts.length - 1).join('.');

        const parentNode = this.findNodeByPath(parentPath);
        if (!parentNode) return null;
        const options = unwrapJSON(parentNode)?.properties
        if (!options) return null;
        const final = Object.keys(options)
            .map(key => {
                const json = unwrapJSON(options[key])
                if (!json) return undefined
                if (json.anyOf) {
                    const types = json.anyOf.map(a => unwrapJSON(a)?.type).filter(a => a != undefined).map(a => String(a))
                    const type = this.mapTypeToCompletionType(types)
                    return {
                        label: key,
                        type: type,
                        info: "",
                        detail: type
                    }
                }
                const type = this.mapTypeToCompletionType(String(json.type))
                return {
                    label: key,
                    type: type,
                    info: "",
                    detail: type
                }
            })
            .filter(a => a != undefined)
            .filter(c => c.label.startsWith(currentFragment))
        console.log(final)
        return {
            from: from + text.length - currentFragment.length,
            options: final
        };
    }
    private findNodeByPath(path: string): JSONSchema | undefined {
        if (!path) return undefined;
        const parts = path.split('.');
        if (!unwrapJSON(this.schema)?.properties && !unwrapJSON(this.schema)?.properties?.['tables']) return undefined
        let currentNodes = unwrapJSON(unwrapJSON(this.schema)?.properties?.tables)?.properties as Record<string, JSONSchema>;
        let currentNode: JSONSchema | undefined = undefined;

        for (const part of parts) {
            const key = Object.keys(currentNodes).find(key => key === part) || undefined;
            if (!key) return undefined
            currentNode = unwrapJSON(currentNodes[key]);
            if (!currentNode || currentNode.type !== 'object') return undefined;
            currentNodes = currentNode.properties as Record<string, JSONSchema>;
        }

        return currentNode;
    }
    private mapTypeToCompletionType(type: string | string[]): string {
        if (typeof type == "string") {
            switch (type) {
                case 'string': return 'text';
                case 'number': return 'number';
                case "integer": return "number";
                case "bigint": return "number";
                case 'boolean': return 'boolean';
                case 'object': return 'variable';
                case 'array': return 'array';
                default: return 'variable';
            }
        }
        const isNull = type.includes("null")
        return type.filter(a => a != "null")[0] + (isNull ? "?" : "")
    }
}

export function tabSearchHighlighter() {
    return StreamLanguage.define(
        simpleMode({
            start: [
                // base literals
                {
                    regex: /true|false|null/,
                    token: "bool",
                },
                {
                    regex: /and|or/,
                    token: "operator",
                },
                // double quoted string
                { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string" },
                // single quoted string
                { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string" },
                // numbers
                {
                    regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
                    token: "number",
                },
                // operators
                {
                    regex: /\&\&|\|\||\=|\!\=|\~|\!\~|\>|\<|\>\=|\<\=|startwiths|endwiths/,
                    token: "operator",
                },
                // indent and dedent properties guide autoindentation
                { regex: /[\{\[\(]/, indent: true },
                { regex: /[\}\]\)]/, dedent: true },
                // keywords
                { regex: /@[\w_]+/, token: "keyword" },
                { regex: /\.[\w_\.]+/, token: "variableName" }
            ],
        }),
    );
}

export function tabSearchLockInline() {
    return EditorState.transactionFilter.of((tr) => {
        if (tr.newDoc.lines > 1) {
            //@ts-ignore
            if (!tr.changes?.inserted?.filter((i) => !!i.text.find((t) => t))?.length) {
                return [];
            }
            //@ts-ignore
            tr.newDoc.text = [tr.newDoc.text.join(" ")];
        }
        return tr;
    })
}

export function tabSearchAutocomplete(schema: JSONSchema) {
    return new LanguageAutocomplete(schema).getAutocompletion()
}