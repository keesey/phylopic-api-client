import { Headers as NodeFetchHeaders } from 'node-fetch';
export interface ETagMetadata {
    readonly eTag?: string;
}
export const extractETag = (headers: Headers | NodeFetchHeaders) => {
    const value = headers.get('etag');
    return value ? { eTag: value } : {};
};
export default extractETag;
