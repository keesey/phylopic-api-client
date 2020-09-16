import fetch from 'cross-fetch';
export declare interface APIClientOptionsComplete {
    readonly apiKey: string;
    readonly baseURL: string;
    readonly fetch: typeof fetch;
    readonly jwt: string;
}
export type APIClientOptions = Partial<APIClientOptionsComplete>;
