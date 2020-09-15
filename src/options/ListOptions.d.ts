import { CacheableOptions } from './CacheableOptions';
import { RangeOptions } from './RangeOptions';
export interface ListOptions extends CacheableOptions, RangeOptions {
    readonly created?: Readonly<[Date | null, Date | null]>;
    readonly embed?: ReadonlySet<string>;
    readonly modified?: Readonly<[Date | null, Date | null]>;
    readonly sort?: ReadonlyArray<string>;
}
