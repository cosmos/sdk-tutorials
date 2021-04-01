import { Reader, Writer } from "protobufjs/minimal";
export declare const protobufPackage = "username.voter.voter";
/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreatePoll {
    creator: string;
    title: string;
    options: string[];
}
export interface MsgCreatePollResponse {
    id: number;
}
export interface MsgUpdatePoll {
    creator: string;
    id: number;
    title: string;
    options: string[];
}
export interface MsgUpdatePollResponse {
}
export interface MsgDeletePoll {
    creator: string;
    id: number;
}
export interface MsgDeletePollResponse {
}
export declare const MsgCreatePoll: {
    encode(message: MsgCreatePoll, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgCreatePoll;
    fromJSON(object: any): MsgCreatePoll;
    toJSON(message: MsgCreatePoll): unknown;
    fromPartial(object: DeepPartial<MsgCreatePoll>): MsgCreatePoll;
};
export declare const MsgCreatePollResponse: {
    encode(message: MsgCreatePollResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgCreatePollResponse;
    fromJSON(object: any): MsgCreatePollResponse;
    toJSON(message: MsgCreatePollResponse): unknown;
    fromPartial(object: DeepPartial<MsgCreatePollResponse>): MsgCreatePollResponse;
};
export declare const MsgUpdatePoll: {
    encode(message: MsgUpdatePoll, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgUpdatePoll;
    fromJSON(object: any): MsgUpdatePoll;
    toJSON(message: MsgUpdatePoll): unknown;
    fromPartial(object: DeepPartial<MsgUpdatePoll>): MsgUpdatePoll;
};
export declare const MsgUpdatePollResponse: {
    encode(_: MsgUpdatePollResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgUpdatePollResponse;
    fromJSON(_: any): MsgUpdatePollResponse;
    toJSON(_: MsgUpdatePollResponse): unknown;
    fromPartial(_: DeepPartial<MsgUpdatePollResponse>): MsgUpdatePollResponse;
};
export declare const MsgDeletePoll: {
    encode(message: MsgDeletePoll, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgDeletePoll;
    fromJSON(object: any): MsgDeletePoll;
    toJSON(message: MsgDeletePoll): unknown;
    fromPartial(object: DeepPartial<MsgDeletePoll>): MsgDeletePoll;
};
export declare const MsgDeletePollResponse: {
    encode(_: MsgDeletePollResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgDeletePollResponse;
    fromJSON(_: any): MsgDeletePollResponse;
    toJSON(_: MsgDeletePollResponse): unknown;
    fromPartial(_: DeepPartial<MsgDeletePollResponse>): MsgDeletePollResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
    /** this line is used by starport scaffolding # proto/tx/rpc */
    CreatePoll(request: MsgCreatePoll): Promise<MsgCreatePollResponse>;
    UpdatePoll(request: MsgUpdatePoll): Promise<MsgUpdatePollResponse>;
    DeletePoll(request: MsgDeletePoll): Promise<MsgDeletePollResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    CreatePoll(request: MsgCreatePoll): Promise<MsgCreatePollResponse>;
    UpdatePoll(request: MsgUpdatePoll): Promise<MsgUpdatePollResponse>;
    DeletePoll(request: MsgDeletePoll): Promise<MsgDeletePollResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
