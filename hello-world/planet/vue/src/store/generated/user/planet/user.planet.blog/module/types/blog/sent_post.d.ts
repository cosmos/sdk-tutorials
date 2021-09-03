import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "user.planet.blog";
export interface SentPost {
    creator: string;
    id: number;
    postID: string;
    title: string;
    chain: string;
}
export declare const SentPost: {
    encode(message: SentPost, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): SentPost;
    fromJSON(object: any): SentPost;
    toJSON(message: SentPost): unknown;
    fromPartial(object: DeepPartial<SentPost>): SentPost;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
