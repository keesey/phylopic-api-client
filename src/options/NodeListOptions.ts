import { ListOptions } from './ListOptions';
import { NodeEmbedField } from './NodeEmbedField';
export declare type NodeSortField = 'created' | 'modified' | 'names' | '-created' | '-modified' | '-names';
export declare interface NodeListOptions extends ListOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
    readonly sort?: ReadonlyArray<NodeSortField>;
}
