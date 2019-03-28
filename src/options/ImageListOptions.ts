import { ImageEmbedField } from './ImageEmbedField';
import { ListOptions } from './ListOptions';
export declare type ImageSortField = 'created' | 'modified' | '-created' | '-modified';
export declare type LicenseComponentSpecification = 'by' | 'nc' | 'sa' | '-by' | '-nc' | '-sa';
export declare interface ImageListOptions extends ListOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
    readonly licenseComponents?: ReadonlySet<LicenseComponentSpecification>;
    readonly sort?: ReadonlyArray<ImageSortField>;
}
