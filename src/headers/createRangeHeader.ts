export const createRangeHeader = (range: Readonly<[number, number]>) => ({
    Range: `items=${range.join('-')}`,
});
export default createRangeHeader;
