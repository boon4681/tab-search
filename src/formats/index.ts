import { FormatRegistry } from '@sinclair/typebox'
import { IsDateTime } from './date-time'
import { IsDate } from './date'
import { IsTime } from './time'
import { IsEmail } from './email'
import { IsUuid } from './uuid'
import { IsUrl } from './url'
import { IsJsDate } from './js-date'

FormatRegistry.Set('date-time', value => IsDateTime(value, true))
FormatRegistry.Set('js-date', value => IsJsDate(value))
FormatRegistry.Set('date', value => IsDate(value))
FormatRegistry.Set('time', value => IsTime(value))
FormatRegistry.Set('email', value => IsEmail(value))
FormatRegistry.Set('uuid', value => IsUuid(value))
FormatRegistry.Set('url', value => IsUrl(value))
