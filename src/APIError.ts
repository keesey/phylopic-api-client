import { Error as ErrorData } from 'phylopic-api-types';
export default class APIError extends Error {
    constructor(
        public readonly httpCode: number,
        public readonly data: ReadonlyArray<ErrorData>,
    ) {
        super((data && data.length && data[0] && data[0].developerMessage) || 'Unknown error.');
    }
}
