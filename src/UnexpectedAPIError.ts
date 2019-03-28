import APIError from './APIError';
export class UnexpectedAPIError extends APIError {
    constructor(response: Response) {
        super(response.status, [{
            developerMessage: response.statusText,
            type: response.status < 500 ? 'DEFAULT_4XX' : 'DEFAULT_5XX',
            userMessage: 'An unexpected error occurred.',
        }]);
    }
}
