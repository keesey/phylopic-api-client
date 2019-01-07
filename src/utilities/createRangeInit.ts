import { DATA } from 'phylopic-api-types';
import { RangeOptions } from '../options/RangeOptions';
export const createRangeInit = (options: RangeOptions) => {
    return {
        headers: new Headers({
            Accept: DATA,
            Range: `items=${options.range.join('-')}`,
        }),
        method: 'GET',
    } as RequestInit;
};
export default createRangeInit;
