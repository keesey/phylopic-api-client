import { RangeOptions } from './RangeOptions';
export declare interface SetOptions extends RangeOptions {
    readonly created?: Readonly<[Date | null, Date | null]>;
    readonly embed?: ReadonlySet<string>;
    readonly modified?: Readonly<[Date | null, Date | null]>;
    readonly sort?: ReadonlyArray<string>;
}
