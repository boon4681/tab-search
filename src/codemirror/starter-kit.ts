import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
    EditorView,
    keymap,
    rectangularSelection,
    placeholder as placeholderExt,
    highlightSpecialChars,
    dropCursor,
    highlightActiveLineGutter,
    drawSelection,
} from "@codemirror/view";
import { bracketMatching } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { Compartment, Prec, type Extension } from "@codemirror/state";
import { tabSearchAutocomplete, tabSearchHighlighter, tabSearchLockInline } from "./extensions";
import { LightTheme, DarkTheme } from './theme';
import { EDITOR_INTERFACE_V1 } from "../interface";

export default function StarterKit(options: {
    placeholder?: string,
    theme?: "light" | "dark" | string,
    schema: EDITOR_INTERFACE_V1
} = { theme: "light", schema: {} }) {
    const languageCompartment = new Compartment();
    const placeholderCompartment = new Compartment();
    const themeCompartment = new Compartment();
    const schemaCompartment = new Compartment();
    const themes = (theme: "dark" | "light" | string) => {
        if (theme == "dark") {
            return DarkTheme;
        } else {
            return LightTheme;
        }
    };
    const componentStyles = EditorView.theme({
        "&": {
            margin: "0.25em",
            outline: "none",
            fontFamily: "monospace",
            overflow: "hidden",
        },
        "&.cm-focused": {
            outline: "none",
        },
        ".cm-content": {
            overflow: "hidden",
        },
        ".cm-scroller": {
            flexGrow: "1",
            overflow: "hidden",
            outline: "0 !important",
        },
        ".cm-tooltip-autocomplete": {
            zIndex: "9999",
            padding: "0",
            fontSize: "1em",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "0.5em",
        },
        ".cm-tooltip-autocomplete ul": {
            margin: "0",
            borderRadius: "inherit",
        },
        ".cm-tooltip-autocomplete ul > :first-child": {
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
        },
        ".cm-tooltip-autocomplete ul > :last-child": {
            borderBottomLeftRadius: "inherit",
            borderBottomRightRadius: "inherit",
        },
        ".cm-tooltip-autocomplete ul li": {
            display: "flex",
        },
        ".cm-tooltip-autocomplete .cm-completionDetail": {
            marginLeft: "auto",
        },
        ".cm-cursorLayer .cm-cursor": {
            marginLeft: "0 !important",
        },
        ".cm-placeholder": {
            fontSize: "1em",
        },
        "&.cm-focused .cm-matchingBracket": {
            backgroundColor: "rgba(50, 140, 130, 0.1)",
        },
    });
    const extensions: Extension[] = [
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
        Prec.highest(keymap.of(completionKeymap)),
        keymap.of([
            ...closeBracketsKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...defaultKeymap,
        ]),
        componentStyles,
        languageCompartment.of(tabSearchHighlighter()),
        tabSearchLockInline(),
        schemaCompartment.of(tabSearchAutocomplete(options.schema)),
        placeholderCompartment.of(options.placeholder ? placeholderExt(options.placeholder) : []),
        themeCompartment.of(themes(options.theme ?? "light")),
    ]

    function changeTheme(editor: EditorView, theme: "dark" | "light" | string = "light") {
        editor.dispatch({
            effects: themeCompartment.reconfigure(themes(theme))
        })
    }

    function changePlaceholder(editor: EditorView, placeholder?: string) {
        editor.dispatch({
            effects: placeholderCompartment.reconfigure(placeholder ? placeholderExt(placeholder) : [])
        })
    }

    function changeSchema(editor: EditorView, schema: EDITOR_INTERFACE_V1) {
        editor.dispatch({
            effects: schemaCompartment.reconfigure(tabSearchAutocomplete(schema))
        })
    }

    return { extensions, changeTheme, changePlaceholder, changeSchema }
}
