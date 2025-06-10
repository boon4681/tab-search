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
import { EDITOR_INTERFACE_V1, EDITOR_INTERFACE_V1_TABLE } from "../interface";

export type CodeMirrorSuggestion = { label: string, type: string, info: string }

class LanguageAutocomplete {
    private tables: Array<CodeMirrorSuggestion> = []
    private default_literals: Array<CodeMirrorSuggestion> = [
        { label: "true", type: "boolean", info: "" },
        { label: "false", type: "boolean", info: "" },
        { label: "null", type: "null", info: "" },
    ];
    private literals: Array<CodeMirrorSuggestion> = [];
    private operators: Array<CodeMirrorSuggestion> = [
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
        { label: "contains", type: "operator", info: "" },
    ];
    constructor(private schema: EDITOR_INTERFACE_V1) {
        this.updateSchema(schema)
    }
    public updateSchema(schema: EDITOR_INTERFACE_V1) {
        this.schema = schema
        this.literals = [...this.default_literals, ...(schema.suggestions ?? [])]
        this.tables = Object.keys(this.schema.tables ?? {}).map(key => {
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

                const options = [
                    ...this.literals,
                ].filter(c => c.label.toLowerCase().startsWith(before.text.toLowerCase()))
                return {
                    from: before.from,
                    options: [...options].map(a => {
                        return { ...a, label: a.label.slice(0, -1) }
                    })
                };
            }
            let table = context.matchBefore(/@[\w_]*/);
            if (table) {
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
            const options = [
                ...this.operators,
                ...this.literals,
            ].filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase()))
            return {
                from: word.from,
                options: [...options]
            };
        };
    }
    private handlePropertyAccess(text: string, from: number): CompletionResult | null {
        const parts = text.split('.');
        const currentFragment = parts[parts.length - 1];
        const parentPath = parts.slice(0, parts.length - 1).join('.');

        const parentNode = this.findNodeByPath(parentPath);
        if (!parentNode) return null;
        const options = parentNode
        if (!options) return null;
        const final = Object.keys(options)
            .map(key => {
                const json = options[key]
                if (!json) return undefined
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
        return {
            from: from + text.length - currentFragment.length,
            options: final
        };
    }
    private findNodeByPath(path: string): EDITOR_INTERFACE_V1_TABLE | undefined {
        if (!path) return undefined;
        const parts = path.split('.');
        if (!this.schema.tables) return undefined
        let currentNodes = this.schema.tables
        let currentNode: EDITOR_INTERFACE_V1_TABLE | undefined = undefined;

        for (const part of parts) {
            const key = Object.keys(currentNodes).find(key => key === part) || undefined;
            if (!key) return undefined
            currentNode = currentNodes[key];
            if (!currentNode) return undefined;
            currentNodes = currentNode.properties as any;
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
                    token: "typeOperator",
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

export function tabSearchAutocomplete(schema: EDITOR_INTERFACE_V1) {
    return new LanguageAutocomplete(schema).getAutocompletion()
}