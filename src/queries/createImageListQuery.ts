import { ImageListOptions } from '../options/ImageListOptions';
import setToArray from '../utilities/setToArray';
import createListQuery from './createListQuery';
export const createImageListQuery = (options: ImageListOptions) => {
    const query = createListQuery(options);
    if (options.licenseComponents) {
        query.licensecomponents = setToArray(options.licenseComponents).join(' ');
    }
    return query;
};
export default createImageListQuery;
