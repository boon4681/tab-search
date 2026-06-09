import register from "preact-custom-element";
import { useEffect, useRef } from "preact/hooks";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import StarterKit from "./starter-kit";
import { EDITOR_INTERFACE_V1 } from "../interface";

export interface TabSearchProps {
    placeholder?: string
    src?: string
    schema?: EDITOR_INTERFACE_V1 | string
    theme?: string
    value?: string
}

export interface TabSearchChangeDetail {
    doc: string
}

export interface TabSearchReadyDetail {
    schema: EDITOR_INTERFACE_V1
    src?: string
}

export interface TabSearchErrorDetail {
    error: unknown
    src?: string
}

export interface TabSearchElement extends HTMLElement, TabSearchProps {}

declare global {
    interface HTMLElementTagNameMap {
        "tab-search": TabSearchElement
    }
}

const hostStyles = `
    :host {
        display: block;
        min-height: 28px;
    }
`;

function TabSearch({ placeholder, src, schema, theme, value }: TabSearchProps) {
    const ref = useRef<HTMLDivElement>(null)
    const editorRef = useRef<EditorView | null>(null)
    const starterKitRef = useRef<ReturnType<typeof StarterKit> | null>(null)
    const syncingValueRef = useRef(false)

    useEffect(() => {
        const self = ref.current
        if (!self) return

        const starterKit = StarterKit({ placeholder, schema: {}, theme })
        const docChangeExtension = EditorView.updateListener.of((update) => {
            if (!update.docChanged) return
            if (syncingValueRef.current) {
                syncingValueRef.current = false
                return
            }
            const doc = update.state.doc.toString()
            self.dispatchEvent(new CustomEvent("change", {
                detail: { doc }, composed: true, bubbles: true
            }))
        });
        const submitKeymap = Prec.high(keymap.of([
            {
                key: "Enter",
                run: (view) => {
                    self.dispatchEvent(new CustomEvent("submit", {
                        detail: { doc: view.state.doc.toString() }, composed: true, bubbles: true
                    }))
                    return true
                },
            },
        ]))
        const editor = new EditorView({
            doc: value ?? "",
            extensions: [
                docChangeExtension,
                starterKit.extensions,
                submitKeymap,
            ],
            parent: self,
        })

        starterKitRef.current = starterKit
        editorRef.current = editor

        return () => {
            editor.destroy()
            editorRef.current = null
            starterKitRef.current = null
        }
    }, [])

    useEffect(() => {
        const editor = editorRef.current
        const starterKit = starterKitRef.current
        if (!editor || !starterKit) return
        starterKit.changeTheme(editor, theme)
    }, [theme])

    useEffect(() => {
        const editor = editorRef.current
        const starterKit = starterKitRef.current
        if (!editor || !starterKit) return
        starterKit.changePlaceholder(editor, placeholder)
    }, [placeholder])

    useEffect(() => {
        const editor = editorRef.current
        if (!editor || value === undefined) return
        const currentValue = editor.state.doc.toString()
        if (currentValue === value) return

        syncingValueRef.current = true
        editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: value },
            selection: { anchor: value.length },
        })
    }, [value])

    useEffect(() => {
        const editor = editorRef.current
        const starterKit = starterKitRef.current
        const self = ref.current
        if (!editor || !starterKit || !self) return

        const applySchema = (nextSchema: EDITOR_INTERFACE_V1 | string) => {
            try {
                const parsed = typeof nextSchema === "string"
                    ? JSON.parse(nextSchema) as EDITOR_INTERFACE_V1
                    : nextSchema
                starterKit.changeSchema(editor, parsed)
                self.dispatchEvent(new CustomEvent("ready", {
                    detail: { schema: parsed, src }, composed: true, bubbles: true
                }))
            } catch (error) {
                self.dispatchEvent(new CustomEvent("error", {
                    detail: { error, src }, composed: true, bubbles: true
                }))
            }
        }

        if (schema !== undefined) {
            applySchema(schema)
            return
        }
        if (!src) {
            applySchema({})
            return
        }

        const controller = new AbortController()
        fetch(src, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load tab-search schema: ${response.status} ${response.statusText}`)
                }
                return response.json()
            })
            .then(applySchema)
            .catch((error) => {
                if (controller.signal.aborted) return
                self.dispatchEvent(new CustomEvent("error", {
                    detail: { error, src }, composed: true, bubbles: true
                }))
            })

        return () => controller.abort()
    }, [schema, src])

    return <>
        <style>{hostStyles}</style>
        <div className="tab-search" ref={ref}></div>
    </>
}

if (typeof customElements !== "undefined" && !customElements.get("tab-search")) {
    register(TabSearch, "tab-search", ["placeholder", "src", "schema", "theme", "value"], { shadow: true });
}
