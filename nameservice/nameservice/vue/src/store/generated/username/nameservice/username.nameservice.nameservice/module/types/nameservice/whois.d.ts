import { Writer, Reader } from "protobufjs/minimal";
export declare const protobufPackage = "username.nameservice.nameservice";
export interface Whois {
    owner: string;
    id: number;
    name: string;
    price: number;
}
export declare const Whois: {
    encode(message: Whois, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array, length?: number): Whois;
    fromJSON(object: any): Whois;
    toJSON(message: Whois): unknown;
    fromPartial(object: DeepPartial<Whois>): Whois;
};
declare type Builtin = Date | Function | Uint8Array | string | number | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
