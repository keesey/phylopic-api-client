export const setToArray = <T>(s: ReadonlySet<T>) => [...s].sort() as ReadonlyArray<T>;
export default setToArray;

