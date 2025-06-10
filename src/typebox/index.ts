import "./formats"
import { AssertError } from "@sinclair/typebox/value";
import { Type } from "@sinclair/typebox";
export const StringToDate = Type.Transform(Type.String({ format: 'js-date' }))
    .Decode(value => new Date(value))
    .Encode(value => value.toISOString())

export const resolveSafeParse = (cast: () => any) => {
    try {
        return [cast(), undefined] as const
    } catch (error) {
        return [undefined, error as AssertError] as const
    }
}