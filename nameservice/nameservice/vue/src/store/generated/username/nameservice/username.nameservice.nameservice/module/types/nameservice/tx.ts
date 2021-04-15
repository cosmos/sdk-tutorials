/* eslint-disable */
import { Reader, util, configure, Writer } from "protobufjs/minimal";
import * as Long from "long";

export const protobufPackage = "username.nameservice.nameservice";

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

export interface MsgUpdateWhoisResponse {}

export interface MsgDeleteWhois {
  owner: string;
  id: number;
}

export interface MsgDeleteWhoisResponse {}

const baseMsgCreateWhois: object = { owner: "", name: "", price: 0 };

export const MsgCreateWhois = {
  encode(message: MsgCreateWhois, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.price !== 0) {
      writer.uint32(24).int32(message.price);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateWhois {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgCreateWhois } as MsgCreateWhois;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.name = reader.string();
          break;
        case 3:
          message.price = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateWhois {
    const message = { ...baseMsgCreateWhois } as MsgCreateWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = "";
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = Number(object.price);
    } else {
      message.price = 0;
    }
    return message;
  },

  toJSON(message: MsgCreateWhois): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.name !== undefined && (obj.name = message.name);
    message.price !== undefined && (obj.price = message.price);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCreateWhois>): MsgCreateWhois {
    const message = { ...baseMsgCreateWhois } as MsgCreateWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = "";
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    } else {
      message.price = 0;
    }
    return message;
  },
};

const baseMsgCreateWhoisResponse: object = { id: 0 };

export const MsgCreateWhoisResponse = {
  encode(
    message: MsgCreateWhoisResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateWhoisResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgCreateWhoisResponse } as MsgCreateWhoisResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgCreateWhoisResponse {
    const message = { ...baseMsgCreateWhoisResponse } as MsgCreateWhoisResponse;
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id);
    } else {
      message.id = 0;
    }
    return message;
  },

  toJSON(message: MsgCreateWhoisResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial(
    object: DeepPartial<MsgCreateWhoisResponse>
  ): MsgCreateWhoisResponse {
    const message = { ...baseMsgCreateWhoisResponse } as MsgCreateWhoisResponse;
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = 0;
    }
    return message;
  },
};

const baseMsgUpdateWhois: object = { owner: "", id: 0, name: "", price: 0 };

export const MsgUpdateWhois = {
  encode(message: MsgUpdateWhois, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.price !== 0) {
      writer.uint32(32).int32(message.price);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateWhois {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgUpdateWhois } as MsgUpdateWhois;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.id = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.price = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgUpdateWhois {
    const message = { ...baseMsgUpdateWhois } as MsgUpdateWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id);
    } else {
      message.id = 0;
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    } else {
      message.name = "";
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = Number(object.price);
    } else {
      message.price = 0;
    }
    return message;
  },

  toJSON(message: MsgUpdateWhois): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.id !== undefined && (obj.id = message.id);
    message.name !== undefined && (obj.name = message.name);
    message.price !== undefined && (obj.price = message.price);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgUpdateWhois>): MsgUpdateWhois {
    const message = { ...baseMsgUpdateWhois } as MsgUpdateWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = 0;
    }
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    } else {
      message.name = "";
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    } else {
      message.price = 0;
    }
    return message;
  },
};

const baseMsgUpdateWhoisResponse: object = {};

export const MsgUpdateWhoisResponse = {
  encode(_: MsgUpdateWhoisResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateWhoisResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgUpdateWhoisResponse } as MsgUpdateWhoisResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgUpdateWhoisResponse {
    const message = { ...baseMsgUpdateWhoisResponse } as MsgUpdateWhoisResponse;
    return message;
  },

  toJSON(_: MsgUpdateWhoisResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgUpdateWhoisResponse>): MsgUpdateWhoisResponse {
    const message = { ...baseMsgUpdateWhoisResponse } as MsgUpdateWhoisResponse;
    return message;
  },
};

const baseMsgDeleteWhois: object = { owner: "", id: 0 };

export const MsgDeleteWhois = {
  encode(message: MsgDeleteWhois, writer: Writer = Writer.create()): Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteWhois {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgDeleteWhois } as MsgDeleteWhois;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.id = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgDeleteWhois {
    const message = { ...baseMsgDeleteWhois } as MsgDeleteWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = String(object.owner);
    } else {
      message.owner = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id);
    } else {
      message.id = 0;
    }
    return message;
  },

  toJSON(message: MsgDeleteWhois): unknown {
    const obj: any = {};
    message.owner !== undefined && (obj.owner = message.owner);
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgDeleteWhois>): MsgDeleteWhois {
    const message = { ...baseMsgDeleteWhois } as MsgDeleteWhois;
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    } else {
      message.owner = "";
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = 0;
    }
    return message;
  },
};

const baseMsgDeleteWhoisResponse: object = {};

export const MsgDeleteWhoisResponse = {
  encode(_: MsgDeleteWhoisResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteWhoisResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgDeleteWhoisResponse } as MsgDeleteWhoisResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgDeleteWhoisResponse {
    const message = { ...baseMsgDeleteWhoisResponse } as MsgDeleteWhoisResponse;
    return message;
  },

  toJSON(_: MsgDeleteWhoisResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgDeleteWhoisResponse>): MsgDeleteWhoisResponse {
    const message = { ...baseMsgDeleteWhoisResponse } as MsgDeleteWhoisResponse;
    return message;
  },
};

/** Msg defines the Msg service. */
export interface Msg {
  /** this line is used by starport scaffolding # proto/tx/rpc */
  CreateWhois(request: MsgCreateWhois): Promise<MsgCreateWhoisResponse>;
  UpdateWhois(request: MsgUpdateWhois): Promise<MsgUpdateWhoisResponse>;
  DeleteWhois(request: MsgDeleteWhois): Promise<MsgDeleteWhoisResponse>;
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }
  CreateWhois(request: MsgCreateWhois): Promise<MsgCreateWhoisResponse> {
    const data = MsgCreateWhois.encode(request).finish();
    const promise = this.rpc.request(
      "username.nameservice.nameservice.Msg",
      "CreateWhois",
      data
    );
    return promise.then((data) =>
      MsgCreateWhoisResponse.decode(new Reader(data))
    );
  }

  UpdateWhois(request: MsgUpdateWhois): Promise<MsgUpdateWhoisResponse> {
    const data = MsgUpdateWhois.encode(request).finish();
    const promise = this.rpc.request(
      "username.nameservice.nameservice.Msg",
      "UpdateWhois",
      data
    );
    return promise.then((data) =>
      MsgUpdateWhoisResponse.decode(new Reader(data))
    );
  }

  DeleteWhois(request: MsgDeleteWhois): Promise<MsgDeleteWhoisResponse> {
    const data = MsgDeleteWhois.encode(request).finish();
    const promise = this.rpc.request(
      "username.nameservice.nameservice.Msg",
      "DeleteWhois",
      data
    );
    return promise.then((data) =>
      MsgDeleteWhoisResponse.decode(new Reader(data))
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array
  ): Promise<Uint8Array>;
}

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
