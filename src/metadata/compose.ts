export const compose = <TMetadata>(extractors: Iterable<(headers: Headers) => Partial<TMetadata>>) => {
    return (headers: Headers) => [...extractors]
        .reduce((metadata, extractor) => ({ ...metadata, ...extractor(headers)}), {}) as TMetadata;
};
export default compose;
