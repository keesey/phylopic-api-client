import { ListOptions } from './ListOptions';
import { NodeEmbedField } from './NodeEmbedField';
export type NodeSortField = 'created' | 'modified' | 'names' | '-created' | '-modified' | '-names';
export interface NodeListOptions extends ListOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
    readonly sort?: ReadonlyArray<NodeSortField>;
}
