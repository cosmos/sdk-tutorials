import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "user.planet.blog";
export interface TimedoutPost {
    creator: string;
    id: number;
    title: string;
    chain: string;
}
export declare const TimedoutPost: {
    encode(message: TimedoutPost, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): TimedoutPost;
    fromJSON(object: any): TimedoutPost;
    toJSON(message: TimedoutPost): unknown;
    fromPartial(object: DeepPartial<TimedoutPost>): TimedoutPost;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
