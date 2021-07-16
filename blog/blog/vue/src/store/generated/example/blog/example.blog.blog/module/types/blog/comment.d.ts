import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "example.blog.blog";
export interface Comment {
    creator: string;
    id: number;
    body: string;
    postID: string;
}
export declare const Comment: {
    encode(message: Comment, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): Comment;
    fromJSON(object: any): Comment;
    toJSON(message: Comment): unknown;
    fromPartial(object: DeepPartial<Comment>): Comment;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
