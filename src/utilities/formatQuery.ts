export const formatQuery = (query: { [key: string]: string; }) => {
    const keys = Object.keys(query);
    return keys.length
        ? `?${keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&')}`
        : '';
};
export default formatQuery;
