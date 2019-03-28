export interface ETagMetadata {
    readonly eTag: string;
}
export const extractETag = (headers: Headers) => ({
    eTag: headers.get('etag'),
} as ETagMetadata);
export default extractETag;
