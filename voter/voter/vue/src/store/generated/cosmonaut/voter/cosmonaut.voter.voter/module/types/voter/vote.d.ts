import { Writer, Reader } from 'protobufjs/minimal';
export declare const protobufPackage = "cosmonaut.voter.voter";
export interface Vote {
    creator: string;
    id: number;
    pollID: string;
    option: string;
}
export declare const Vote: {
    encode(message: Vote, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): Vote;
    fromJSON(object: any): Vote;
    toJSON(message: Vote): unknown;
    fromPartial(object: DeepPartial<Vote>): Vote;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
