export const createIfNotMatchHeader = (eTag?: string) => eTag ? {
    'If-Not-Match': eTag,
} : {} as Record<string, string>;
export default createIfNotMatchHeader;
