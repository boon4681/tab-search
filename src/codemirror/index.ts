
export * from "./extensions"

if (typeof window !== 'undefined') {
    import("./editor")
}