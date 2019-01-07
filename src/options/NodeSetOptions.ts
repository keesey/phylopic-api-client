import { NodeEmbedField } from './NodeEmbedField';
import { SetOptions } from './SetOptions';
export declare type NodeSortField = 'created' | 'modified' | 'names' | '-created' | '-modified' | '-names';
export declare interface NodeSetOptions extends SetOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
    readonly sort?: ReadonlyArray<NodeSortField>,
}
