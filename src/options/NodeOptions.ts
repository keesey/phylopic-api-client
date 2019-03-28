import { CacheableOptions } from './CacheableOptions';
import { NodeEmbedField } from './NodeEmbedField';
export declare interface NodeOptions extends CacheableOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
}
