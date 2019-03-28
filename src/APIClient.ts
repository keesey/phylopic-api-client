import {
    Account,
    DATA,
    EntityParameters,
    EntityReference,
    Error as PhyloPicError,
    Image,
    ImageListParameters,
    ImagePatch,
    ImagePost,
    ImageWithEmbedded,
    List,
    ListParameters,
    NodePatch,
    NodePost,
    NodeSearch,
    NodeWithEmbedded,
    QueryMatches,
    Root,
    TitledLink,
    validateImagePatch,
    validateImagePost,
    validateNodePatch,
    validateNodePost,
    ValidationFault,
} from 'phylopic-api-types';
import { APIClientOptions, APIClientOptionsComplete } from './APIClientOptions';
import APIError from './APIError';
import { APIResponse } from './APIResponse';
import { UnexpectedAPIError } from './UnexpectedAPIError';
export type EntityHeadersAndParameters = EntityParameters & Partial<{
    eTag: string,
}>;
export type ListHeadersAndParameters = ListParameters & Partial<{
    eTag: string,
}> & {
    range: [number, number],
};
export type ImageListHeadersAndParameters = ImageListParameters & ListHeadersAndParameters;
const DEFAULT_API_OPTIONS: APIClientOptionsComplete = {
    apiKey: '',
    baseURL: 'https://api./phylopic.org/',
    fetch,
    jwt: '',
};
const ENTITY_QUERY_PARAMS: ReadonlyArray<keyof EntityParameters> = [
    'embed',
];
const LIST_QUERY_PARAMS: ReadonlyArray<keyof ListParameters> = [
    ...ENTITY_QUERY_PARAMS,
    'contributor',
    'created_gt',
    'created_lt',
    'modified_gt',
    'modified_lt',
    'sort',
];
const IMAGE_LIST_QUERY_PARAMS: ReadonlyArray<keyof ImageListParameters> = [
    ...LIST_QUERY_PARAMS,
    'licensecomponents',
];
const checkValidations = (
    validations: ReadonlyArray<ValidationFault>,
    type: 'BAD_REQUEST_BODY' | 'BAD_REQUEST_PARAMETERS',
    userMessage: string,
) => {
    if (validations.length) {
        throw new APIError(400, validations.map((validation) => ({
            developerMessage: validation.message,
            field: validation.field,
            type,
            userMessage,
        })));
    }
};
const statusHasBody = (status: number) => {
    return status !== 204 && status !== 304;
};
const createAPIResponse = async <T>(response: Response) => {
    const data = statusHasBody(response.status) ? (await response.json()) as T : null;
    return {
        data,
        headers: response.headers,
        status: response.status,
    } as APIResponse<T>;
};
const createBasicHeaders = () => new Headers({
    Accept: DATA,
});
const createBasicRequestInit = () => ({
    headers: createBasicHeaders(),
} as RequestInit);
const createCacheableHeaders = (eTags: string | undefined) => {
    const headers = createBasicHeaders();
    if (eTags) {
        headers.set('If-None-Match', eTags);
    }
    return headers;
};
const createCacheableRequestInit = (eTags: string | undefined) => ({
    headers: createCacheableHeaders(eTags),
    method: 'GET',
} as RequestInit);
const createDeleteRequestInit = (eTag: string) => ({
    headers: createModificationHeaders(eTag),
    method: 'DELETE',
} as RequestInit);
const createEntityRequestInit = (options: EntityHeadersAndParameters | undefined) => {
    const headers = createBasicHeaders();
    if (options && options.eTag) {
        headers.append('If-None-Match', options.eTag);
    }
    return {
        headers,
        method: 'GET',
    } as RequestInit;
};
const createListRequestInit = (options: ListHeadersAndParameters) => {
    const headers = createBasicHeaders();
    headers.append('Range', `items=${options.range[0]}-${options.range[1]}`);
    if (options.eTag) {
        headers.append('If-Match', options.eTag);
    }
    return {
        headers,
        method: 'GET',
    } as RequestInit;
};
const createModificationHeaders = (eTag: string) => {
    const headers = createBasicHeaders();
    headers.set('If-Match', eTag);
    return headers;
};
const createPatchRequestInit = (eTag: string, body?: any) => ({
    body: body ? JSON.stringify(body) : undefined,
    headers: createModificationHeaders(eTag),
    method: 'PATCH',
} as RequestInit);
const createPostRequestInit = (body: any) => ({
    body: JSON.stringify(body),
    headers: createBasicHeaders(),
    method: 'POST',
} as RequestInit);
const createQueryString = (query: Record<string, any>) => {
    const q = Object
        .keys(query)
        .filter((key) => query[key] !== undefined)
        .sort()
        .reduce((pairs, key) => {
            const pair = [key, query[key]]
                .map(encodeURIComponent)
                .join('=');
            return [...pairs, pair];
        }, [] as string[])
        .join('&');
    return q ? `?${q}` : '';
};
const pick = <T>(params: T, keys: ReadonlyArray<string & keyof T>) =>
    keys.reduce((q, key) => {
        q[key] = params[key];
        return q;
    }, {} as Record<string, any>);
const createQuery = <T>(params: T, keys: ReadonlyArray<string & keyof T>) =>
    createQueryString(pick(params, keys));
export class APIClient {
    private options: APIClientOptionsComplete;
    constructor(options: APIClientOptions = {}) {
        const baseURL = options.baseURL
            ? (options.baseURL.endsWith('/') ? options.baseURL : `${options.baseURL}/`)
            : DEFAULT_API_OPTIONS.baseURL;
        this.options = {
            ...DEFAULT_API_OPTIONS,
            ...options,
            baseURL,
        };
    }
    public authorize(jsonWebToken: string): void;
    public authorize(jsonWebToken: Promise<string>): Promise<void>;
    public async authorize(jsonWebToken: string | Promise<string>) {
        const jwt = String(await jsonWebToken) || '';
        this.options = {
            ...this.options,
            jwt,
        };
    }
    public deauthorize() {
        this.options = {
            ...this.options,
            jwt: '',
        };
    }
    public async deleteImage(uuid: string, eTag: string) {
        const response = await this.makeCall(
            `images/${uuid}`,
            this.authorizeRequest(createDeleteRequestInit(eTag)),
        );
        return createAPIResponse<Node>(response);
    }
    public async deleteNode(uuid: string, eTag: string) {
        const response = await this.makeCall(
            `nodes/${uuid}`,
            this.authorizeRequest(createDeleteRequestInit(eTag)),
        );
        return createAPIResponse<Node>(response);
    }
    public async deleteSubmission(uuid: string, eTag: string) {
        const response = await this.makeCall(
            `submissions/${uuid}`,
            this.authorizeRequest(createDeleteRequestInit(eTag)),
        );
        return createAPIResponse<Node>(response);
    }
    public async getAccount(uuid: string, eTags?: string) {
        const response = await this.makeCall(
            `accounts/${uuid}`,
            this.identifyRequest(createCacheableRequestInit(eTags)),
        );
        return createAPIResponse<Account>(response);
    }
    public async getAutocomplete(query: string) {
        const init = createBasicRequestInit();
        const response = await this.makeCall(
            `autocomplete${createQueryString({ query })}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<QueryMatches>(response);
    }
    public async getCladeImages(uuid: string, options: ImageListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `cladeimages/${uuid}${createQuery(options, IMAGE_LIST_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<List<Image>>(response);
    }
    public async getImage(uuid: string, options?: EntityHeadersAndParameters) {
        const init = createEntityRequestInit(options);
        const response = await this.makeCall(
            `images/${uuid}${createQuery(options || {}, ENTITY_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<ImageWithEmbedded>(response);
    }
    public async getImages(options: ImageListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `images${createQuery(options, IMAGE_LIST_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<List<Image>>(response);
    }
    public async getLicenses(eTags?: string) {
        const init = createCacheableRequestInit(eTags);
        const response = await this.makeCall(
            'licenses',
            this.identifyRequest(init),
        );
        return createAPIResponse<ReadonlyArray<TitledLink>>(response);
    }
    public async getLineage(options: ListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `lineage${createQuery(options, LIST_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<List<Node>>(response);
    }
    public async getNode(uuid: string, options?: EntityHeadersAndParameters) {
        const init = createEntityRequestInit(options);
        const response = await this.makeCall(
            `nodes/${uuid}${createQuery(options || {}, ENTITY_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<NodeWithEmbedded>(response);
    }
    public async getNodeImages(uuid: string, options: ImageListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `nodeimages/${uuid}${createQuery(options, IMAGE_LIST_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<List<Image>>(response);
    }
    public async getNodes(options: ListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `nodes${createQuery(options, LIST_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<List<Image>>(response);
    }
    public async getRoot(eTags?: string) {
        const response = await this.makeCall(
            '',
            this.identifyRequest(createCacheableRequestInit(eTags)),
        );
        return createAPIResponse<Root>(response);
    }
    public async getRootNode(params?: EntityParameters) {
        const init = createEntityRequestInit(params);
        const response = await this.makeCall(
            `rootnode${params ? createQueryString(params) : ''}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<EntityReference>(response);
    }
    public async getSubmission(uuid: string, options?: EntityHeadersAndParameters) {
        const init = createEntityRequestInit(options);
        const response = await this.makeCall(
            `submissions/${uuid}${createQuery(options || {}, ENTITY_QUERY_PARAMS)}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<ImageWithEmbedded>(response);
    }
    public async getSubmissions(options: ImageListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `submission${createQuery(options, IMAGE_LIST_QUERY_PARAMS)}`,
            this.authorizeRequest(init),
        );
        return createAPIResponse<List<Image>>(response);
    }
    public async patchImage(uuid: string, eTag: string, patch: ImagePatch) {
        checkValidations(
            validateImagePatch(patch),
            'BAD_REQUEST_BODY',
            'Invalid attempt to update a silhouette image.',
        );
        const response = await this.makeCall(
            `images/${uuid}`,
            this.authorizeRequest(createPatchRequestInit(eTag, patch)),
        );
        return createAPIResponse<Image>(response);
    }
    public async patchNode(uuid: string, eTag: string, patch: NodePatch) {
        checkValidations(
            validateNodePatch(patch),
            'BAD_REQUEST_BODY',
            'Invalid attempt to update a phylogenetic node.',
        );
        const response = await this.makeCall(
            `nodes/${uuid}`,
            this.authorizeRequest(createPatchRequestInit(eTag, patch)),
        );
        return createAPIResponse<Node>(response);
    }
    public async patchSubmission(uuid: string, eTag: string) {
        const response = await this.makeCall(
            `submissions/${uuid}`,
            this.authorizeRequest(createPatchRequestInit(eTag)),
        );
        return createAPIResponse<null>(response);
    }
    public async ping() {
        const response = await fetch(`${this.options.baseURL}ping`);
        if (!response.ok) {
            throw new UnexpectedAPIError(response);
        }
    }
    public async postImage(uuid: string, post: ImagePost) {
        checkValidations(
            validateImagePost(post),
            'BAD_REQUEST_BODY',
            'Invalid attempt to create a silhouette image.',
        );
        const response = await this.makeCall(
            `images/${uuid}`,
            this.authorizeRequest(createPostRequestInit(post)),
        );
        return createAPIResponse<Image>(response);
    }
    public async postNode(uuid: string, post: NodePost) {
        checkValidations(
            validateNodePost(post),
            'BAD_REQUEST_BODY',
            'Invalid attempt to create a phylogenetic node.',
        );
        const response = await this.makeCall(
            `nodes/${uuid}`,
            this.authorizeRequest(createPostRequestInit(post)),
        );
        return createAPIResponse<Node>(response);
    }
    public async resolve(uri: string, params?: EntityParameters) {
        const init = createEntityRequestInit(params);
        const response = await this.makeCall(
            `resolve${createQueryString({ uri, embed: (params || {}).embed })}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<EntityReference>(response);
    }
    public async searchNodes(query: string, options: ListHeadersAndParameters) {
        const init = createListRequestInit(options);
        const response = await this.makeCall(
            `search/nodes${createQueryString({ query, ...pick(options, LIST_QUERY_PARAMS) })}`,
            this.identifyRequest(init),
        );
        return createAPIResponse<NodeSearch>(response);
    }
    private authorizeRequest(init: RequestInit) {
        const { jwt } = this.options;
        if (!jwt) {
            throw new APIError(401, [{
                developerMessage: 'You are not authorized for this method.',
                field: 'Authorization',
                type: 'MISSING_AUTHENTICATION_TOKEN',
                userMessage: 'Please sign in before attempting this operation.',
            }]);
        }
        const headers = new Headers(init.headers);
        headers.append('Authorization', `Bearer ${jwt}`);
        return {
            ...init,
            headers,
        };
    }
    private identifyRequest(init: RequestInit) {
        const { apiKey } = this.options;
        if (!apiKey) {
            throw new APIError(401, [{
                developerMessage: 'This method requires an API Key.',
                field: 'X-API-Key',
                type: 'INVALID_API_KEY',
                userMessage: 'You must register for an API Key for this operation.',
            }]);
        }
        const headers = new Headers(init.headers);
        headers.append('X-API-Key', apiKey);
        return {
            ...init,
            headers,
        };
    }
    private async makeCall(path: string, init?: RequestInit) {
        const { baseURL, fetch } = this.options;
        const response = await fetch(`${baseURL}${path}`, init);
        if (response.ok) {
            return response;
        }
        if (response.headers.get('content-type') === DATA) {
            const errors: ReadonlyArray<PhyloPicError> = await response.json();
            if (errors && errors.length) {
                throw new APIError(response.status, errors, response.headers);
            }
        }
        throw new UnexpectedAPIError(response);
    }
}
export default APIClient;
