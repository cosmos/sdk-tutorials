import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "user.planet.blog";
export interface BlogPacketData {
    noData: NoData | undefined;
    /** this line is used by starport scaffolding # ibc/packet/proto/field */
    ibcPostPacket: IbcPostPacketData | undefined;
}
export interface NoData {
}
/**
 * this line is used by starport scaffolding # ibc/packet/proto/message
 * IbcPostPacketData defines a struct for the packet payload
 */
export interface IbcPostPacketData {
    title: string;
    content: string;
}
/** IbcPostPacketAck defines a struct for the packet acknowledgment */
export interface IbcPostPacketAck {
    postID: string;
}
export declare const BlogPacketData: {
    encode(message: BlogPacketData, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): BlogPacketData;
    fromJSON(object: any): BlogPacketData;
    toJSON(message: BlogPacketData): unknown;
    fromPartial(object: DeepPartial<BlogPacketData>): BlogPacketData;
};
export declare const NoData: {
    encode(_: NoData, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): NoData;
    fromJSON(_: any): NoData;
    toJSON(_: NoData): unknown;
    fromPartial(_: DeepPartial<NoData>): NoData;
};
export declare const IbcPostPacketData: {
    encode(message: IbcPostPacketData, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): IbcPostPacketData;
    fromJSON(object: any): IbcPostPacketData;
    toJSON(message: IbcPostPacketData): unknown;
    fromPartial(object: DeepPartial<IbcPostPacketData>): IbcPostPacketData;
};
export declare const IbcPostPacketAck: {
    encode(message: IbcPostPacketAck, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): IbcPostPacketAck;
    fromJSON(object: any): IbcPostPacketAck;
    toJSON(message: IbcPostPacketAck): unknown;
    fromPartial(object: DeepPartial<IbcPostPacketAck>): IbcPostPacketAck;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
