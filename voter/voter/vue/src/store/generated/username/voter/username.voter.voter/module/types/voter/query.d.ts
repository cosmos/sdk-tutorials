import { Reader, Writer } from "protobufjs/minimal";
import { Poll } from "../voter/poll";
import { PageRequest, PageResponse } from "../cosmos/base/query/v1beta1/pagination";
export declare const protobufPackage = "username.voter.voter";
/** this line is used by starport scaffolding # 3 */
export interface QueryGetPollRequest {
    id: number;
}
export interface QueryGetPollResponse {
    Poll: Poll | undefined;
}
export interface QueryAllPollRequest {
    pagination: PageRequest | undefined;
}
export interface QueryAllPollResponse {
    Poll: Poll[];
    pagination: PageResponse | undefined;
}
export declare const QueryGetPollRequest: {
    encode(message: QueryGetPollRequest, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): QueryGetPollRequest;
    fromJSON(object: any): QueryGetPollRequest;
    toJSON(message: QueryGetPollRequest): unknown;
    fromPartial(object: DeepPartial<QueryGetPollRequest>): QueryGetPollRequest;
};
export declare const QueryGetPollResponse: {
    encode(message: QueryGetPollResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): QueryGetPollResponse;
    fromJSON(object: any): QueryGetPollResponse;
    toJSON(message: QueryGetPollResponse): unknown;
    fromPartial(object: DeepPartial<QueryGetPollResponse>): QueryGetPollResponse;
};
export declare const QueryAllPollRequest: {
    encode(message: QueryAllPollRequest, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): QueryAllPollRequest;
    fromJSON(object: any): QueryAllPollRequest;
    toJSON(message: QueryAllPollRequest): unknown;
    fromPartial(object: DeepPartial<QueryAllPollRequest>): QueryAllPollRequest;
};
export declare const QueryAllPollResponse: {
    encode(message: QueryAllPollResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): QueryAllPollResponse;
    fromJSON(object: any): QueryAllPollResponse;
    toJSON(message: QueryAllPollResponse): unknown;
    fromPartial(object: DeepPartial<QueryAllPollResponse>): QueryAllPollResponse;
};
/** Query defines the gRPC querier service. */
export interface Query {
    /** this line is used by starport scaffolding # 2 */
    Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse>;
    PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse>;
}
export declare class QueryClientImpl implements Query {
    private readonly rpc;
    constructor(rpc: Rpc);
    Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse>;
    PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
