import { history, indentWithTab } from "@codemirror/commands";
import { EditorView, basicSetup } from "codemirror";
import {
    lineNumbers,
    keymap,
    rectangularSelection,
    placeholder as placeholderExt,
    highlightSpecialChars,
    dropCursor,
    highlightActiveLineGutter,
    drawSelection,
} from "@codemirror/view";
import { indentUnit, foldGutter, bracketMatching } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { EditorState, Compartment } from "@codemirror/state";
import { tabSearchAutocomplete, tabSearchHighlighter, tabSearchLockInline } from "./extensions";
import { LightTheme, DarkTheme } from './theme';
import { type JSONSchema } from "json-schema-typed/draft-07";
import { EDITOR_INTERFACE_V1 } from "../interface";

export default function StarterKit(options: {
    placeholder?: string,
    theme?: "light" | "dark" | string,
    schema: EDITOR_INTERFACE_V1
} = { theme: "light", schema: {} }) {
    const languageCompartment = new Compartment();
    const placeholderCompartment = new Compartment();
    const themeCompartment = new Compartment();
    const themes = (theme: "dark" | "light" | string) => {
        if (theme == "dark") {
            return DarkTheme;
        } else {
            return LightTheme;
        }
    };
    const extensions = [
        EditorView.lineWrapping,
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        highlightSelectionMatches(),
        EditorView.theme({
            "&": {
                overflow: "hidden",
            },
            ".cm-content": {
                overflow: "hidden",
            },
            ".cm-scroller": {
                overflow: "hidden",
            },
        }),
        keymap.of([
            {
                key: "Enter",
                run: () => true, // Capture Enter key and do nothing
            },
        ]),
        // tab search extension
        languageCompartment.of(tabSearchHighlighter()),
        tabSearchLockInline(),
        tabSearchAutocomplete(options.schema)
    ]
    if (options.placeholder) {
        extensions.push(placeholderCompartment.of(placeholderExt(options.placeholder)))
    }
    function changeTheme(editor: EditorView, theme: "dark" | "light") {
        editor.dispatch({
            effects: themeCompartment.reconfigure(themes(theme))
        })
    }
    extensions.push(themeCompartment.of(themes(options.theme ?? "light")))
    return { extensions, changeTheme }
}