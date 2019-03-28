export const formatQuery = (query: Record<string, any> | undefined) => {
    if (!query) {
        return '';
    }
    const keys = Object.keys(query);
    return keys.length
        ? `?${keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&')}`
        : '';
};
export default formatQuery;
