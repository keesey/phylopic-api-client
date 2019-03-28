import { Error as ErrorData } from 'phylopic-api-types';
export default class APIError extends Error {
    public readonly headers: Headers;
    constructor(
        public readonly httpCode: number,
        public readonly data: ReadonlyArray<ErrorData>,
        headers: HeadersInit = {},
    ) {
        super((data && data.length && data[0] && data[0].developerMessage) || 'Unknown error.');
        this.headers = new Headers(headers);
    }
}
