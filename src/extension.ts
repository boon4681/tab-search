import { AstFunction, Literal } from "./ast.internal.types";

export type Extension = FunctionExtension
export type AstFunctionResolver = (func: AstFunction) => Literal
export type FunctionExtension = {
    name: string,
    resolve: AstFunctionResolver
}

export function createFunctionExtension(name: string, resolve: AstFunctionResolver) {
    return {
        name,
        resolve
    }
}