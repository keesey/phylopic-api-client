import { SetOptions } from '../options/SetOptions';
import setToArray from './setToArray';
export const createSetQuery = (options: SetOptions) => {
    const query: { [key: string]: string; } = {};
    if (options.created) {
        if (options.created[0]) {
            query.created_gt = options.created[0].toISOString();
        }
        if (options.created[1]) {
            query.created_lt = options.created[1].toISOString();
        }
    }
    if (options.embed && options.embed.size) {
        query.embed = setToArray(options.embed).join(' ');
    }
    if (options.modified) {
        if (options.modified[0]) {
            query.modified_gt = options.modified[0].toISOString();
        }
        if (options.modified[1]) {
            query.modified_lt = options.modified[1].toISOString();
        }
    }
    if (options.sort && options.sort.length) {
        query.sort = options.sort.join(' ');
    }
    return query;
};
export default createSetQuery;
