Object.defineProperties(Range.prototype, {
    getBoundingClientRect: {
        configurable: true,
        value: () => new DOMRect(),
    },
    getClientRects: {
        configurable: true,
        value: () => [],
    },
});

Object.defineProperty(Document.prototype, "execCommand", {
    configurable: true,
    value: () => false,
});
