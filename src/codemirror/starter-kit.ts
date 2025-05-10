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
} from "@codemirror/view";
import { indentUnit, foldGutter, bracketMatching } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { EditorState, Compartment } from "@codemirror/state";
import { tabSearchAutocomplete, tabSearchHighlighter, tabSearchLockInline } from "./extensions";
import { githubLight, githubDark } from './theme';
import { type JSONSchema } from "json-schema-typed/draft-07";

export default function StarterKit(options: {
    placeholder?: string,
    theme?: "light" | "dark" | string,
    schema: JSONSchema
} = { theme: "light", schema: {} }) {
    const languageCompartment = new Compartment();
    const placeholderCompartment = new Compartment();
    const themeCompartment = new Compartment();
    const themes = (theme: "dark" | "light" | string) => {
        if (theme == "dark") {
            return githubDark;
        } else {
            return githubLight;
        }
    };
    const extensions = [
        EditorView.lineWrapping,
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        bracketMatching(),
        closeBrackets(),
        dropCursor(),
        rectangularSelection(),
        highlightSelectionMatches(),
        history(),
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
    extensions.push(themeCompartment.of(themes(options.theme ?? "light")))
    return extensions
}