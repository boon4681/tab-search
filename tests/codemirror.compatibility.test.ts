import { afterEach, describe, expect, test, vi } from "vitest";
import { currentCompletions, startCompletion } from "@codemirror/autocomplete";
import { basicSetup, EditorView } from "codemirror";
import type { EDITOR_INTERFACE_V1 } from "../src/interface";

import "../src/codemirror/editor";

type TabSearchElement = HTMLElement & {
    schema?: EDITOR_INTERFACE_V1;
    value?: string;
};

const schema: EDITOR_INTERFACE_V1 = {
    tables: {
        user: {
            id: { type: "number" },
            email: { type: "string" },
        },
    },
};

async function createTabSearch(attributes: Record<string, string> = {}) {
    const element = document.createElement("tab-search") as TabSearchElement;
    document.body.append(element);
    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }

    await vi.waitFor(() => {
        expect(element.shadowRoot?.querySelector(".cm-editor")).toBeTruthy();
    });

    return element;
}

afterEach(() => {
    document.body.replaceChildren();
    document.head.replaceChildren();
    vi.unstubAllGlobals();
});

describe("tab-search CodeMirror compatibility", () => {
    test("runs beside a host CodeMirror editor and isolates global cm-* selectors", async () => {
        const globalStyle = document.createElement("style");
        globalStyle.textContent = ".cm-editor { display: none !important; }";
        document.head.append(globalStyle);

        const hostContainer = document.createElement("div");
        document.body.append(hostContainer);
        const hostEditor = new EditorView({
            doc: "host editor",
            extensions: basicSetup,
            parent: hostContainer,
        });

        const tabSearch = await createTabSearch();

        expect(document.querySelectorAll(".cm-editor")).toHaveLength(1);
        expect(hostContainer.querySelector(".cm-editor")).toBe(hostEditor.dom);
        expect(tabSearch.shadowRoot?.querySelector(".cm-editor")).toBeTruthy();

        hostEditor.destroy();
    });

    test("updates value, schema, placeholder, and theme without recreating the editor", async () => {
        const tabSearch = await createTabSearch({
            placeholder: "Search users",
            theme: "light",
            value: "@user.id == 1",
        });
        const editor = tabSearch.shadowRoot?.querySelector(".cm-editor");

        tabSearch.value = "@user.email == 'test@example.com'";
        const readyEvent = new Promise<CustomEvent>((resolve) => {
            tabSearch.addEventListener("ready", (event) => resolve(event as CustomEvent), { once: true });
        });
        tabSearch.schema = schema;
        tabSearch.setAttribute("placeholder", "Filter users");
        tabSearch.setAttribute("theme", "dark");
        await readyEvent;

        await vi.waitFor(() => {
            expect(tabSearch.shadowRoot?.querySelector(".cm-content")?.textContent)
                .toContain("@user.email == 'test@example.com'");
        });

        expect(tabSearch.shadowRoot?.querySelector(".cm-editor")).toBe(editor);

        tabSearch.value = "";
        await vi.waitFor(() => {
            expect(tabSearch.shadowRoot?.querySelector(".cm-placeholder")?.textContent)
                .toBe("Filter users");
        });

        tabSearch.value = "@u";
        const view = EditorView.findFromDOM(editor as HTMLElement);
        expect(view).toBeTruthy();
        await vi.waitFor(() => {
            expect(view?.state.doc.toString()).toBe("@u");
        });
        view!.focus();
        startCompletion(view!);
        await vi.waitFor(() => {
            expect(currentCompletions(view!.state).map((completion) => completion.label))
                .toContain("user");
        });
    });

    test("stays usable and emits an error event when schema loading fails", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
            new Response("no schema", { status: 503, statusText: "Unavailable" }),
        ));

        const tabSearch = document.createElement("tab-search") as TabSearchElement;
        const errorEvent = new Promise<CustomEvent>((resolve) => {
            tabSearch.addEventListener("error", (event) => resolve(event as CustomEvent), { once: true });
        });
        document.body.append(tabSearch);
        tabSearch.setAttribute("src", "/broken-schema");

        const event = await errorEvent;

        expect(event.detail.src).toBe("/broken-schema");
        expect(event.detail.error).toBeInstanceOf(Error);
        expect(tabSearch.shadowRoot?.querySelector(".cm-editor")).toBeTruthy();
    });

    test("removes the focused outline and emits submit when Enter is not used by autocomplete", async () => {
        const tabSearch = await createTabSearch({ value: "@user.id == 1" });
        const editor = tabSearch.shadowRoot?.querySelector(".cm-editor") as HTMLElement;
        const content = tabSearch.shadowRoot?.querySelector(".cm-content") as HTMLElement;
        const submit = vi.fn();
        tabSearch.onsubmit = submit;

        const view = EditorView.findFromDOM(editor);
        expect(view).toBeTruthy();
        await vi.waitFor(() => {
            expect(view!.state.doc.toString()).toBe("@user.id == 1");
        });
        view!.focus();

        const shadowStyles = Array.from(tabSearch.shadowRoot!.querySelectorAll("style"))
            .map((style) => style.textContent)
            .join("\n");
        expect(shadowStyles).toContain("outline: none");

        content.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            bubbles: true,
            cancelable: true,
        }));

        expect(submit).toHaveBeenCalledOnce();
        expect((submit.mock.calls[0][0] as CustomEvent).detail)
            .toEqual({ doc: "@user.id == 1" });
        expect(view!.state.doc.lines).toBe(1);
    });
});
