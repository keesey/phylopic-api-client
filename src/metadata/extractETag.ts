import { Headers } from 'cross-fetch';
export interface ETagMetadata {
    readonly eTag?: string;
}
export const extractETag = (headers: Headers) => {
    const value = headers.get('etag');
    return value ? { eTag: value } : {};
};
export default extractETag;
