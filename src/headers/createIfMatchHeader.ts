export const createIfMatchHeader = (eTag?: string) => eTag ? {
    'If-Match': eTag,
} : {} as Record<string, string>;
export default createIfMatchHeader;
