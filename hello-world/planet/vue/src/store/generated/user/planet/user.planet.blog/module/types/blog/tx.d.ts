import { Reader, Writer } from 'protobufjs/minimal';
export declare const protobufPackage = "user.planet.blog";
/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgSendIbcPost {
    sender: string;
    port: string;
    channelID: string;
    timeoutTimestamp: number;
    title: string;
    content: string;
}
export interface MsgSendIbcPostResponse {
}
export declare const MsgSendIbcPost: {
    encode(message: MsgSendIbcPost, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgSendIbcPost;
    fromJSON(object: any): MsgSendIbcPost;
    toJSON(message: MsgSendIbcPost): unknown;
    fromPartial(object: DeepPartial<MsgSendIbcPost>): MsgSendIbcPost;
};
export declare const MsgSendIbcPostResponse: {
    encode(_: MsgSendIbcPostResponse, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): MsgSendIbcPostResponse;
    fromJSON(_: any): MsgSendIbcPostResponse;
    toJSON(_: MsgSendIbcPostResponse): unknown;
    fromPartial(_: DeepPartial<MsgSendIbcPostResponse>): MsgSendIbcPostResponse;
};
/** Msg defines the Msg service. */
export interface Msg {
    /** this line is used by starport scaffolding # proto/tx/rpc */
    SendIbcPost(request: MsgSendIbcPost): Promise<MsgSendIbcPostResponse>;
}
export declare class MsgClientImpl implements Msg {
    private readonly rpc;
    constructor(rpc: Rpc);
    SendIbcPost(request: MsgSendIbcPost): Promise<MsgSendIbcPostResponse>;
}
interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
