import { ImageEmbedField } from './ImageEmbedField';
import { ListOptions } from './ListOptions';
export type ImageSortField = 'created' | 'modified' | '-created' | '-modified';
export type LicenseComponentSpecification = 'by' | 'nc' | 'sa' | '-by' | '-nc' | '-sa';
export interface ImageListOptions extends ListOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
    readonly licenseComponents?: ReadonlySet<LicenseComponentSpecification>;
    readonly sort?: ReadonlyArray<ImageSortField>;
}
