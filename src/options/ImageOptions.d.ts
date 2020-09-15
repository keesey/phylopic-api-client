import { CacheableOptions } from './CacheableOptions';
import { ImageEmbedField } from './ImageEmbedField';
export interface ImageOptions extends CacheableOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
}
