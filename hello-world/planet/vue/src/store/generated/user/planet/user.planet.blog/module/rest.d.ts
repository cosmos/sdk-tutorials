export declare type BlogMsgSendIbcPostResponse = object;
export interface BlogPost {
    creator?: string;
    /** @format uint64 */
    id?: string;
    title?: string;
    content?: string;
}
export interface BlogQueryAllPostResponse {
    Post?: BlogPost[];
    /**
     * PageResponse is to be embedded in gRPC response messages where the
     * corresponding request message has used PageRequest.
     *
     *  message SomeResponse {
     *          repeated Bar results = 1;
     *          PageResponse page = 2;
     *  }
     */
    pagination?: V1Beta1PageResponse;
}
export interface BlogQueryAllSentPostResponse {
    SentPost?: BlogSentPost[];
    /**
     * PageResponse is to be embedded in gRPC response messages where the
     * corresponding request message has used PageRequest.
     *
     *  message SomeResponse {
     *          repeated Bar results = 1;
     *          PageResponse page = 2;
     *  }
     */
    pagination?: V1Beta1PageResponse;
}
export interface BlogQueryAllTimedoutPostResponse {
    TimedoutPost?: BlogTimedoutPost[];
    /**
     * PageResponse is to be embedded in gRPC response messages where the
     * corresponding request message has used PageRequest.
     *
     *  message SomeResponse {
     *          repeated Bar results = 1;
     *          PageResponse page = 2;
     *  }
     */
    pagination?: V1Beta1PageResponse;
}
export interface BlogQueryGetPostResponse {
    Post?: BlogPost;
}
export interface BlogQueryGetSentPostResponse {
    SentPost?: BlogSentPost;
}
export interface BlogQueryGetTimedoutPostResponse {
    TimedoutPost?: BlogTimedoutPost;
}
export interface BlogSentPost {
    creator?: string;
    /** @format uint64 */
    id?: string;
    postID?: string;
    title?: string;
    chain?: string;
}
export interface BlogTimedoutPost {
    creator?: string;
    /** @format uint64 */
    id?: string;
    title?: string;
    chain?: string;
}
export interface ProtobufAny {
    typeUrl?: string;
    /** @format byte */
    value?: string;
}
export interface RpcStatus {
    /** @format int32 */
    code?: number;
    message?: string;
    details?: ProtobufAny[];
}
/**
* message SomeRequest {
         Foo some_parameter = 1;
         PageRequest pagination = 2;
 }
*/
export interface V1Beta1PageRequest {
    /**
     * key is a value returned in PageResponse.next_key to begin
     * querying the next page most efficiently. Only one of offset or key
     * should be set.
     * @format byte
     */
    key?: string;
    /**
     * offset is a numeric offset that can be used when key is unavailable.
     * It is less efficient than using key. Only one of offset or key should
     * be set.
     * @format uint64
     */
    offset?: string;
    /**
     * limit is the total number of results to be returned in the result page.
     * If left empty it will default to a value to be set by each app.
     * @format uint64
     */
    limit?: string;
    /**
     * count_total is set to true  to indicate that the result set should include
     * a count of the total number of items available for pagination in UIs.
     * count_total is only respected when offset is used. It is ignored when key
     * is set.
     */
    countTotal?: boolean;
}
/**
* PageResponse is to be embedded in gRPC response messages where the
corresponding request message has used PageRequest.

 message SomeResponse {
         repeated Bar results = 1;
         PageResponse page = 2;
 }
*/
export interface V1Beta1PageResponse {
    /** @format byte */
    nextKey?: string;
    /** @format uint64 */
    total?: string;
}
export declare type QueryParamsType = Record<string | number, any>;
export declare type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;
export interface FullRequestParams extends Omit<RequestInit, "body"> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean;
    /** request path */
    path: string;
    /** content type of request body */
    type?: ContentType;
    /** query params */
    query?: QueryParamsType;
    /** format of response (i.e. response.json() -> format: "json") */
    format?: keyof Omit<Body, "body" | "bodyUsed">;
    /** request body */
    body?: unknown;
    /** base url */
    baseUrl?: string;
    /** request cancellation token */
    cancelToken?: CancelToken;
}
export declare type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;
export interface ApiConfig<SecurityDataType = unknown> {
    baseUrl?: string;
    baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
    securityWorker?: (securityData: SecurityDataType) => RequestParams | void;
}
export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
    data: D;
    error: E;
}
declare type CancelToken = Symbol | string | number;
export declare enum ContentType {
    Json = "application/json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded"
}
export declare class HttpClient<SecurityDataType = unknown> {
    baseUrl: string;
    private securityData;
    private securityWorker;
    private abortControllers;
    private baseApiParams;
    constructor(apiConfig?: ApiConfig<SecurityDataType>);
    setSecurityData: (data: SecurityDataType) => void;
    private addQueryParam;
    protected toQueryString(rawQuery?: QueryParamsType): string;
    protected addQueryParams(rawQuery?: QueryParamsType): string;
    private contentFormatters;
    private mergeRequestParams;
    private createAbortSignal;
    abortRequest: (cancelToken: CancelToken) => void;
    request: <T = any, E = any>({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }: FullRequestParams) => Promise<HttpResponse<T, E>>;
}
/**
 * @title blog/genesis.proto
 * @version version not set
 */
export declare class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    /**
     * No description
     *
     * @tags Query
     * @name QueryPostAll
     * @summary Queries a list of post items.
     * @request GET:/user/planet/blog/post
     */
    queryPostAll: (query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
    }, params?: RequestParams) => Promise<HttpResponse<BlogQueryAllPostResponse, RpcStatus>>;
    /**
     * No description
     *
     * @tags Query
     * @name QueryPost
     * @summary Queries a post by id.
     * @request GET:/user/planet/blog/post/{id}
     */
    queryPost: (id: string, params?: RequestParams) => Promise<HttpResponse<BlogQueryGetPostResponse, RpcStatus>>;
    /**
     * No description
     *
     * @tags Query
     * @name QuerySentPostAll
     * @summary Queries a list of sentPost items.
     * @request GET:/user/planet/blog/sentPost
     */
    querySentPostAll: (query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
    }, params?: RequestParams) => Promise<HttpResponse<BlogQueryAllSentPostResponse, RpcStatus>>;
    /**
     * No description
     *
     * @tags Query
     * @name QuerySentPost
     * @summary Queries a sentPost by id.
     * @request GET:/user/planet/blog/sentPost/{id}
     */
    querySentPost: (id: string, params?: RequestParams) => Promise<HttpResponse<BlogQueryGetSentPostResponse, RpcStatus>>;
    /**
     * No description
     *
     * @tags Query
     * @name QueryTimedoutPostAll
     * @summary Queries a list of timedoutPost items.
     * @request GET:/user/planet/blog/timedoutPost
     */
    queryTimedoutPostAll: (query?: {
        "pagination.key"?: string;
        "pagination.offset"?: string;
        "pagination.limit"?: string;
        "pagination.countTotal"?: boolean;
    }, params?: RequestParams) => Promise<HttpResponse<BlogQueryAllTimedoutPostResponse, RpcStatus>>;
    /**
     * No description
     *
     * @tags Query
     * @name QueryTimedoutPost
     * @summary Queries a timedoutPost by id.
     * @request GET:/user/planet/blog/timedoutPost/{id}
     */
    queryTimedoutPost: (id: string, params?: RequestParams) => Promise<HttpResponse<BlogQueryGetTimedoutPostResponse, RpcStatus>>;
}
export {};
