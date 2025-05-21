import { IsDate } from "./date";
import { IsDateTime } from "./date-time";
import { IsTime } from "./time";

export function IsJsDate(value: string): boolean {
    return IsDateTime(value) || IsDate(value) || IsTime(value)
}
