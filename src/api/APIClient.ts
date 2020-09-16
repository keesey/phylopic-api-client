import fetch from 'cross-fetch';
import {
    Account,
    DATA,
    Error as PhyloPicError,
    Image,
    ImagePatch,
    ImagePost,
    ImageWithEmbedded,
    List,
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
import createAcceptHeader from '../headers/createAcceptHeader';
import createIfMatchHeader from '../headers/createIfMatchHeader';
import createIfNotMatchHeader from '../headers/createIfNotMatchHeader';
import createRangeHeader from '../headers/createRangeHeader';
import compose from '../metadata/compose';
import extractContentRange, { ContentRangeMetadata } from '../metadata/extractContentRange';
import extractETag, { ETagMetadata } from '../metadata/extractETag';
import { AccountOptions } from '../options/AccountOptions';
import { CacheableOptions } from '../options/CacheableOptions';
import { ImageListOptions } from '../options/ImageListOptions';
import { ImageOptions } from '../options/ImageOptions';
import { ListOptions } from '../options/ListOptions';
import { NodeEmbedField } from '../options/NodeEmbedField';
import { NodeListOptions } from '../options/NodeListOptions';
import { NodeOptions } from '../options/NodeOptions';
import createImageListQuery from '../queries/createImageListQuery';
import createListQuery from '../queries/createListQuery';
import formatQuery from '../queries/formatQuery';
import { APIClientOptions, APIClientOptionsComplete } from './APIClientOptions';
import APIError from './APIError';
import createAPIResponse from './createAPIResponse';
import { UnexpectedAPIError } from './UnexpectedAPIError';
type EntityPath = 'images' | 'nodes' | 'submissions';
const DEFAULT_API_OPTIONS: APIClientOptionsComplete = {
    apiKey: '',
    baseURL: 'https://api.phylopic.org/',
    fetch,
    jwt: '',
};
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
        return this.deleteEntity('images', uuid, eTag);
    }
    public async deleteNode(uuid: string, eTag: string) {
        return this.deleteEntity('nodes', uuid, eTag);
    }
    public async deleteSubmission(uuid: string, eTag: string) {
        return this.deleteEntity('submissions', uuid, eTag);
    }
    public async getAccount(uuid: string, options?: AccountOptions) {
        const response = await this.makeCall(
            'GET',
            `accounts/${uuid}`,
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
        );
        return createAPIResponse<Account, ETagMetadata>(response, extractETag);
    }
    public async getAutocomplete(query: string) {
        const response = await this.makeCall(
            'GET',
            'autocomplete',
            {
                ...createAcceptHeader(),
                ...this.createAPIKeyHeader(),
            },
            { query },
        );
        return createAPIResponse<QueryMatches, undefined>(response, () => undefined);
    }
    public async getCladeImages(uuid: string, options: ImageListOptions) {
        return this.getImageList(`cladeimages/${uuid}`, options);
    }
    public async getImage(uuid: string, options?: ImageOptions) {
        const response = await this.makeCall(
            'GET',
            `images/${uuid}`,
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
            {
                embed: (options || {}).embed,
            },
        );
        return createAPIResponse<ImageWithEmbedded, ETagMetadata>(response, extractETag);
    }
    public async getImages(options: ImageListOptions) {
        return this.getImageList('images', options);
    }
    public async getLicenses(options?: CacheableOptions) {
        const response = await this.makeCall(
            'GET',
            'licenses',
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
        );
        return createAPIResponse<ReadonlyArray<TitledLink>, ETagMetadata>(response, extractETag);
    }
    public async getLineage(uuid: string, options: NodeListOptions) {
        return this.getNodeList(`lineage/${uuid}`, options);
    }
    public async getNode(uuid: string, options?: NodeOptions) {
        const response = await this.makeCall(
            'GET',
            `nodes/${uuid}`,
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
            {
                embed: (options || {}).embed,
            },
        );
        return createAPIResponse<NodeWithEmbedded, ETagMetadata>(response, extractETag);
    }
    public async getNodeImages(uuid: string, options: ImageListOptions) {
        return this.getImageList(`nodeimages/${uuid}`, options);
    }
    public async getNodes(options: NodeListOptions) {
        return this.getNodeList('nodes', options);
    }
    public async getRoot(options?: CacheableOptions) {
        const response = await this.makeCall(
            'GET',
            '',
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
        );
        return createAPIResponse<Root, ETagMetadata>(response, extractETag);
    }
    public async getRootNode(options?: NodeOptions) {
        const response = await this.makeCall(
            'GET',
            'rootnode',
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
            {
                embed: (options || {}).embed,
            },
            'follow',
        );
        return createAPIResponse<NodeWithEmbedded, ETagMetadata>(response, extractETag);
    }
    public async getSubmission(uuid: string, options?: ImageOptions) {
        const response = await this.makeCall(
            'GET',
            `submissions/${uuid}`,
            {
                ...createAcceptHeader(),
                ...createIfNotMatchHeader((options || {}).eTag),
                ...this.createAPIKeyHeader(),
            },
            {
                embed: (options || {}).embed,
            },
        );
        return createAPIResponse<ImageWithEmbedded, ETagMetadata>(response, extractETag);
    }
    public async getSubmissions(options: ImageListOptions) {
        return this.getImageList('submissions', options);
    }
    public async patchImage(uuid: string, eTag: string, patch: ImagePatch) {
        return this.patchEntity<ImagePatch, Image>('images', uuid, eTag, patch, validateImagePatch);
    }
    public async patchNode(uuid: string, eTag: string, patch: NodePatch) {
        return this.patchEntity<NodePatch, Node>('nodes', uuid, eTag, patch, validateNodePatch);
    }
    public async patchSubmission(uuid: string, eTag: string, patch: ImagePatch) {
        return this.patchEntity<ImagePatch, Image>('submissions', uuid, eTag, patch, validateImagePatch);
    }
    public async ping() {
        const response = await fetch(`${this.options.baseURL}ping`);
        if (!response.ok) {
            throw new UnexpectedAPIError(response);
        }
    }
    public async postImage(uuid: string, post: ImagePost) {
        return this.postEntity<ImagePost, Image>('images', uuid, post, validateImagePost);
    }
    public async postNode(uuid: string, post: NodePost) {
        return this.postEntity<NodePost, Node>('nodes', uuid, post, validateNodePost);
    }
    public async resolve(uri: string, options?: { readonly embed?: ReadonlySet<NodeEmbedField> }) {
        const response = await this.makeCall(
            'GET',
            'resolve',
            {
                ...createAcceptHeader(),
                ...this.createAPIKeyHeader(),
            },
            {
                embed: (options || {}).embed,
                uri,
            },
            'follow',
        );
        return createAPIResponse<NodeWithEmbedded, undefined>(response, () => undefined);
    }
    public async searchNodes(query: string, options: ListOptions) {
        return this.getList<NodeSearch>('search/nodes', options, { query, ...createListQuery(options) });
    }
    protected createAPIKeyHeader() {
        const { apiKey } = this.options;
        if (!apiKey) {
            return {} as Record<string, string>;
        }
        return {
            'X-API-Key': apiKey,
        };
    }
    protected createAuthorizationHeader() {
        const { jwt } = this.options;
        if (!jwt) {
            throw new APIError(401, [{
                developerMessage: 'You are not authorized for this method.',
                field: 'Authorization',
                type: 'MISSING_AUTHENTICATION_TOKEN',
                userMessage: 'Please sign in before attempting this operation.',
            }]);
        }
        return {
            Authorization: `Bearer ${jwt}`,
        };
    }
    protected async deleteEntity(path: EntityPath, uuid: string, eTag: string) {
        const response = await this.makeCall(
            'DELETE',
            `${path}/${uuid}`,
            {
                ...createAcceptHeader(),
                ...this.createAuthorizationHeader(),
                ...createIfMatchHeader(eTag),
            },
        );
        return createAPIResponse<null, undefined>(response, () => undefined);
    }
    protected async getImageList(path: string, options: ImageListOptions) {
        return this.getList<List<ImageWithEmbedded>>(path, options, createImageListQuery(options));
    }
    protected async getList<L extends List<any>>(path: string, options: ListOptions, query: Record<string, any>) {
        const response = await this.makeCall(
            'GET',
            path,
            {
                ...createAcceptHeader(),
                ...createIfMatchHeader(options.eTag),
                ...createRangeHeader(options.range),
                ...this.createAPIKeyHeader(),
            },
            query,
        );
        return createAPIResponse<L, ContentRangeMetadata & ETagMetadata>(
            response,
            compose<ContentRangeMetadata & ETagMetadata>([extractContentRange, extractETag]),
        );
    }
    protected async getNodeList(path: string, options: NodeListOptions) {
        return this.getList<List<NodeWithEmbedded>>(path, options, createListQuery(options));
    }
    protected async makeCall(
        method: 'DELETE' | 'GET' | 'PATCH' | 'POST',
        path: string,
        headers: Record<string, string>,
        query?: Record<string, any>,
        body?: any,
        redirect?: 'error' | 'follow' | 'manual',
    ) {
        const init: RequestInit = {
            body: body ? JSON.stringify(body) : undefined,
            headers: new Headers(headers),
            method,
            redirect,
        };
        // tslint:disable-next-line:no-shadowed-variable
        const { baseURL, fetch } = this.options;
        const response = await fetch(`${baseURL}${path}${formatQuery(query)}`, init);
        if (redirect === 'error' && response.status < 400 && response.status >= 300) {
            throw new APIError(response.status, [{
                developerMessage: `${response.statusText}: ${response.headers.get('location')}`,
                type: 'BAD_REQUEST_BODY',
                userMessage: 'That file was already uploaded.',
            }], response.headers);
        }
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
    protected async patchEntity<P, R>(
        path: EntityPath,
        uuid: string,
        eTag: string,
        patch: P,
        validate: (patch: P) => ReadonlyArray<ValidationFault>,
    ) {
        checkValidations(
            validate(patch),
            'BAD_REQUEST_BODY',
            'Invalid value.',
        );
        const response = await this.makeCall(
            'PATCH',
            `${path}/${uuid}`,
            {
                ...createAcceptHeader(),
                ...this.createAuthorizationHeader(),
                ...createIfMatchHeader(eTag),
            },
            patch,
        );
        return createAPIResponse<R, ETagMetadata>(response, extractETag);
    }
    protected async postEntity<P, R>(
        path: EntityPath,
        uuid: string,
        post: P,
        validate: (post: P) => ReadonlyArray<ValidationFault>,
    ) {
        checkValidations(
            validate(post),
            'BAD_REQUEST_BODY',
            'Invalid value.',
        );
        const response = await this.makeCall(
            'POST',
            `${path}/${uuid}`,
            {
                ...createAcceptHeader(),
                ...this.createAuthorizationHeader(),
            },
            post,
            'error',
        );
        return createAPIResponse<R, ETagMetadata>(response, extractETag);
    }
}
export default APIClient;
