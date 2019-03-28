export const compose = <M>(extractors: Iterable<(headers: Headers) => Partial<M>>) => {
    return (headers: Headers) => [...extractors]
        .reduce((metadata, extractor) => ({ ...metadata, ...extractor(headers)}), {}) as M;
};
export default compose;
