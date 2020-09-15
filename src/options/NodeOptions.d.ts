import { CacheableOptions } from './CacheableOptions';
import { NodeEmbedField } from './NodeEmbedField';
export interface NodeOptions extends CacheableOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
}
