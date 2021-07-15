import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "cosmonaut.voter.voter";
export interface Poll {
    creator: string;
    id: number;
    title: string;
    options: string[];
}
export declare const Poll: {
    encode(message: Poll, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): Poll;
    fromJSON(object: any): Poll;
    toJSON(message: Poll): unknown;
    fromPartial(object: DeepPartial<Poll>): Poll;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
