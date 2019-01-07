import { ImageEmbedField } from './ImageEmbedField';
import { SetOptions } from './SetOptions';
export declare type ImageSortField = 'created' | 'modified' | '-created' | '-modified';
export declare type LicenseComponentSpecification = 'by' | 'nc' | 'sa' | '-by' | '-nc' | '-sa';
export declare interface ImageSetOptions extends SetOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
    readonly licenseComponents?: ReadonlySet<LicenseComponentSpecification>;
    readonly sort?: ReadonlyArray<ImageSortField>;
}
