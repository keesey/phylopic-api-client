const encode = (s: string | number | boolean) => encodeURIComponent(s).replace(/%20/g, '+');
export const formatQuery = (query: Record<string, string | number | boolean> | undefined) => {
    if (!query) {
        return '';
    }
    const keys = Object
        .keys(query)
        .sort();
    return keys.length
        ? `?${keys.map((key) => `${encode(key)}=${encode(query[key])}`).join('&')}`
        : '';
};
export default formatQuery;
