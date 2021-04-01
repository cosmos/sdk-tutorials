/* eslint-disable */
import { Reader, util, configure, Writer } from "protobufjs/minimal";
import * as Long from "long";
import { Poll } from "../voter/poll";
import {
  PageRequest,
  PageResponse,
} from "../cosmos/base/query/v1beta1/pagination";

export const protobufPackage = "username.voter.voter";

/** this line is used by starport scaffolding # 3 */
export interface QueryGetPollRequest {
  id: number;
}

export interface QueryGetPollResponse {
  Poll: Poll | undefined;
}

export interface QueryAllPollRequest {
  pagination: PageRequest | undefined;
}

export interface QueryAllPollResponse {
  Poll: Poll[];
  pagination: PageResponse | undefined;
}

const baseQueryGetPollRequest: object = { id: 0 };

export const QueryGetPollRequest = {
  encode(
    message: QueryGetPollRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPollRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest;
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

  fromJSON(object: any): QueryGetPollRequest {
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest;
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id);
    } else {
      message.id = 0;
    }
    return message;
  },

  toJSON(message: QueryGetPollRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryGetPollRequest>): QueryGetPollRequest {
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest;
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = 0;
    }
    return message;
  },
};

const baseQueryGetPollResponse: object = {};

export const QueryGetPollResponse = {
  encode(
    message: QueryGetPollResponse,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.Poll !== undefined) {
      Poll.encode(message.Poll, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.Poll = Poll.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryGetPollResponse {
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse;
    if (object.Poll !== undefined && object.Poll !== null) {
      message.Poll = Poll.fromJSON(object.Poll);
    } else {
      message.Poll = undefined;
    }
    return message;
  },

  toJSON(message: QueryGetPollResponse): unknown {
    const obj: any = {};
    message.Poll !== undefined &&
      (obj.Poll = message.Poll ? Poll.toJSON(message.Poll) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryGetPollResponse>): QueryGetPollResponse {
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse;
    if (object.Poll !== undefined && object.Poll !== null) {
      message.Poll = Poll.fromPartial(object.Poll);
    } else {
      message.Poll = undefined;
    }
    return message;
  },
};

const baseQueryAllPollRequest: object = {};

export const QueryAllPollRequest = {
  encode(
    message: QueryAllPollRequest,
    writer: Writer = Writer.create()
  ): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPollRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAllPollRequest {
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest;
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination);
    } else {
      message.pagination = undefined;
    }
    return message;
  },

  toJSON(message: QueryAllPollRequest): unknown {
    const obj: any = {};
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageRequest.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryAllPollRequest>): QueryAllPollRequest {
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest;
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination);
    } else {
      message.pagination = undefined;
    }
    return message;
  },
};

const baseQueryAllPollResponse: object = {};

export const QueryAllPollResponse = {
  encode(
    message: QueryAllPollResponse,
    writer: Writer = Writer.create()
  ): Writer {
    for (const v of message.Poll) {
      Poll.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse;
    message.Poll = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.Poll.push(Poll.decode(reader, reader.uint32()));
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): QueryAllPollResponse {
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse;
    message.Poll = [];
    if (object.Poll !== undefined && object.Poll !== null) {
      for (const e of object.Poll) {
        message.Poll.push(Poll.fromJSON(e));
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination);
    } else {
      message.pagination = undefined;
    }
    return message;
  },

  toJSON(message: QueryAllPollResponse): unknown {
    const obj: any = {};
    if (message.Poll) {
      obj.Poll = message.Poll.map((e) => (e ? Poll.toJSON(e) : undefined));
    } else {
      obj.Poll = [];
    }
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? PageResponse.toJSON(message.pagination)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<QueryAllPollResponse>): QueryAllPollResponse {
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse;
    message.Poll = [];
    if (object.Poll !== undefined && object.Poll !== null) {
      for (const e of object.Poll) {
        message.Poll.push(Poll.fromPartial(e));
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromPartial(object.pagination);
    } else {
      message.pagination = undefined;
    }
    return message;
  },
};

/** Query defines the gRPC querier service. */
export interface Query {
  /** this line is used by starport scaffolding # 2 */
  Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse>;
  PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse>;
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }
  Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse> {
    const data = QueryGetPollRequest.encode(request).finish();
    const promise = this.rpc.request(
      "username.voter.voter.Query",
      "Poll",
      data
    );
    return promise.then((data) =>
      QueryGetPollResponse.decode(new Reader(data))
    );
  }

  PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse> {
    const data = QueryAllPollRequest.encode(request).finish();
    const promise = this.rpc.request(
      "username.voter.voter.Query",
      "PollAll",
      data
    );
    return promise.then((data) =>
      QueryAllPollResponse.decode(new Reader(data))
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
