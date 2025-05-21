import { createRef } from "preact";
import register from "preact-custom-element";
import { useEffect, useRef, useState } from "preact/hooks";
import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import StarterKit from "./starter-kit";
import { type JSONSchema } from "json-schema-typed/draft-07";
import { keymap } from "@codemirror/view";

export interface TabSearchProps {
    placeholder?: string
    src: string
    theme?: string
}

function TabSearch({ placeholder, src, theme }: TabSearchProps) {
    if (!src) throw new Error("TabSearch Missing src attribute")
    const ref = createRef<HTMLDivElement>()
    const shadowDoc = createRef<string>()
    const [editor, setEditor] = useState<EditorView>()
    const [ready, setReady] = useState<boolean>(false)
    const [schema, setSchema] = useState<JSONSchema>({})
    const starterKit = StarterKit({ placeholder, schema, theme })

    useEffect(() => {
        fetch(src).then(res => res.json()).then(json => {
            setSchema(json)
            setReady(true)
        }).catch(() => setReady(true))
    }, [])

    useEffect(() => {
        if (!ready || !editor) return;
        starterKit.changeTheme(editor, theme as any)
    }, [theme, ready, editor])

    useEffect(() => {
        if (!ready || editor) return;
        const self = ref.current!
        const docChangeExtension = EditorView.updateListener.of((v) => {
            const doc = v.state.doc.toString()
            shadowDoc.current = doc + ""
            self.dispatchEvent(new CustomEvent("change", {
                detail: { doc }, composed: true, bubbles: true
            }))
        });
        let cm = new EditorView({
            extensions: [
                docChangeExtension,
                keymap.of([
                    {
                        key: "Enter",
                        run: () => {
                            // trigger submit on enter for singleline input
                            self.dispatchEvent(new CustomEvent("submit", {
                                detail: { doc: shadowDoc.current }, composed: true, bubbles: true
                            }))
                            return true
                        },
                    },
                ]),
                starterKit.extensions,
            ],
            parent: ref.current!,
        })
        setEditor(cm)
        return () => {
            cm.destroy()
        }
    }, [ready])
    return <div className="tab-search" ref={ref}></div>
}

register(TabSearch, "tab-search", ["placeholder", "src", "theme"], { shadow: false });
