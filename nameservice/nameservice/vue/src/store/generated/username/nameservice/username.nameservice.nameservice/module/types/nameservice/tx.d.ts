import { Reader, Writer } from "protobufjs/minimal";
export declare const protobufPackage = "username.nameservice.nameservice";
/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreateWhois {
    owner: string;
    name: string;
    price: number;
}
export interface MsgCreateWhoisResponse {
    id: number;
}
export interface MsgUpdateWhois {
    owner: string;
    id: number;
    name: string;
    price: number;
}
export interface MsgUpdateWhoisResponse {
}
export interface MsgDeleteWhois {
    owner: string;
    id: number;
}
export interface MsgDeleteWhoisResponse {
}
export declare const MsgCreateWhois: {
    encode(message: MsgCreateWhois, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgCreateWhois;
    fromJSON(object: any): MsgCreateWhois;
    toJSON(message: MsgCreateWhois): unknown;
    fromPartial(object: DeepPartial<MsgCreateWhois>): MsgCreateWhois;
};
export declare const MsgCreateWhoisResponse: {
    encode(message: MsgCreateWhoisResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgCreateWhoisResponse;
    fromJSON(object: any): MsgCreateWhoisResponse;
    toJSON(message: MsgCreateWhoisResponse): unknown;
    fromPartial(object: DeepPartial<MsgCreateWhoisResponse>): MsgCreateWhoisResponse;
};
export declare const MsgUpdateWhois: {
    encode(message: MsgUpdateWhois, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgUpdateWhois;
    fromJSON(object: any): MsgUpdateWhois;
    toJSON(message: MsgUpdateWhois): unknown;
    fromPartial(object: DeepPartial<MsgUpdateWhois>): MsgUpdateWhois;
};
export declare const MsgUpdateWhoisResponse: {
    encode(_: MsgUpdateWhoisResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgUpdateWhoisResponse;
    fromJSON(_: any): MsgUpdateWhoisResponse;
    toJSON(_: MsgUpdateWhoisResponse): unknown;
    fromPartial(_: DeepPartial<MsgUpdateWhoisResponse>): MsgUpdateWhoisResponse;
};
export declare const MsgDeleteWhois: {
    encode(message: MsgDeleteWhois, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgDeleteWhois;
    fromJSON(object: any): MsgDeleteWhois;
    toJSON(message: MsgDeleteWhois): unknown;
    fromPartial(object: DeepPartial<MsgDeleteWhois>): MsgDeleteWhois;
};
export declare const MsgDeleteWhoisResponse: {
    encode(_: MsgDeleteWhoisResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgDeleteWhoisResponse;
    fromJSON(_: any): MsgDeleteWhoisResponse;
    toJSON(_: MsgDeleteWhoisResponse): unknown;
    fromPartial(_: DeepPartial<MsgDeleteWhoisResponse>): MsgDeleteWhoisResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
    /** this line is used by starport scaffolding # proto/tx/rpc */
    CreateWhois(request: MsgCreateWhois): Promise<MsgCreateWhoisResponse>;
    UpdateWhois(request: MsgUpdateWhois): Promise<MsgUpdateWhoisResponse>;
    DeleteWhois(request: MsgDeleteWhois): Promise<MsgDeleteWhoisResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    CreateWhois(request: MsgCreateWhois): Promise<MsgCreateWhoisResponse>;
    UpdateWhois(request: MsgUpdateWhois): Promise<MsgUpdateWhoisResponse>;
    DeleteWhois(request: MsgDeleteWhois): Promise<MsgDeleteWhoisResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
