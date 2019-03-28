import { CacheableOptions } from './CacheableOptions';
import { ImageEmbedField } from './ImageEmbedField';
export declare interface ImageOptions extends CacheableOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
}
