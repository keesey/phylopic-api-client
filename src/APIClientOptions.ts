export type Fetch = typeof fetch;
export declare interface APIClientOptionsComplete {
    readonly apiKey: string;
    readonly baseURL: string;
    readonly fetch: Fetch;
    readonly jwt: string;
}
export type APIClientOptions = Partial<APIClientOptionsComplete>;
