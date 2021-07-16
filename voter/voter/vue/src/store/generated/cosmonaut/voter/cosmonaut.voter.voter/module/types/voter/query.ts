/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal'
import * as Long from 'long'
import { Vote } from '../voter/vote'
import { PageRequest, PageResponse } from '../cosmos/base/query/v1beta1/pagination'
import { Poll } from '../voter/poll'

export const protobufPackage = 'cosmonaut.voter.voter'

/** this line is used by starport scaffolding # 3 */
export interface QueryGetVoteRequest {
  id: number
}

export interface QueryGetVoteResponse {
  Vote: Vote | undefined
}

export interface QueryAllVoteRequest {
  pagination: PageRequest | undefined
}

export interface QueryAllVoteResponse {
  Vote: Vote[]
  pagination: PageResponse | undefined
}

export interface QueryGetPollRequest {
  id: number
}

export interface QueryGetPollResponse {
  Poll: Poll | undefined
}

export interface QueryAllPollRequest {
  pagination: PageRequest | undefined
}

export interface QueryAllPollResponse {
  Poll: Poll[]
  pagination: PageResponse | undefined
}

const baseQueryGetVoteRequest: object = { id: 0 }

export const QueryGetVoteRequest = {
  encode(message: QueryGetVoteRequest, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetVoteRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetVoteRequest } as QueryGetVoteRequest
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetVoteRequest {
    const message = { ...baseQueryGetVoteRequest } as QueryGetVoteRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: QueryGetVoteRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetVoteRequest>): QueryGetVoteRequest {
    const message = { ...baseQueryGetVoteRequest } as QueryGetVoteRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseQueryGetVoteResponse: object = {}

export const QueryGetVoteResponse = {
  encode(message: QueryGetVoteResponse, writer: Writer = Writer.create()): Writer {
    if (message.Vote !== undefined) {
      Vote.encode(message.Vote, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetVoteResponse } as QueryGetVoteResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Vote = Vote.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetVoteResponse {
    const message = { ...baseQueryGetVoteResponse } as QueryGetVoteResponse
    if (object.Vote !== undefined && object.Vote !== null) {
      message.Vote = Vote.fromJSON(object.Vote)
    } else {
      message.Vote = undefined
    }
    return message
  },

  toJSON(message: QueryGetVoteResponse): unknown {
    const obj: any = {}
    message.Vote !== undefined && (obj.Vote = message.Vote ? Vote.toJSON(message.Vote) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetVoteResponse>): QueryGetVoteResponse {
    const message = { ...baseQueryGetVoteResponse } as QueryGetVoteResponse
    if (object.Vote !== undefined && object.Vote !== null) {
      message.Vote = Vote.fromPartial(object.Vote)
    } else {
      message.Vote = undefined
    }
    return message
  }
}

const baseQueryAllVoteRequest: object = {}

export const QueryAllVoteRequest = {
  encode(message: QueryAllVoteRequest, writer: Writer = Writer.create()): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllVoteRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllVoteRequest } as QueryAllVoteRequest
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryAllVoteRequest {
    const message = { ...baseQueryAllVoteRequest } as QueryAllVoteRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllVoteRequest): unknown {
    const obj: any = {}
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllVoteRequest>): QueryAllVoteRequest {
    const message = { ...baseQueryAllVoteRequest } as QueryAllVoteRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryAllVoteResponse: object = {}

export const QueryAllVoteResponse = {
  encode(message: QueryAllVoteResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.Vote) {
      Vote.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllVoteResponse } as QueryAllVoteResponse
    message.Vote = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Vote.push(Vote.decode(reader, reader.uint32()))
          break
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryAllVoteResponse {
    const message = { ...baseQueryAllVoteResponse } as QueryAllVoteResponse
    message.Vote = []
    if (object.Vote !== undefined && object.Vote !== null) {
      for (const e of object.Vote) {
        message.Vote.push(Vote.fromJSON(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllVoteResponse): unknown {
    const obj: any = {}
    if (message.Vote) {
      obj.Vote = message.Vote.map((e) => (e ? Vote.toJSON(e) : undefined))
    } else {
      obj.Vote = []
    }
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllVoteResponse>): QueryAllVoteResponse {
    const message = { ...baseQueryAllVoteResponse } as QueryAllVoteResponse
    message.Vote = []
    if (object.Vote !== undefined && object.Vote !== null) {
      for (const e of object.Vote) {
        message.Vote.push(Vote.fromPartial(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryGetPollRequest: object = { id: 0 }

export const QueryGetPollRequest = {
  encode(message: QueryGetPollRequest, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPollRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetPollRequest {
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: QueryGetPollRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetPollRequest>): QueryGetPollRequest {
    const message = { ...baseQueryGetPollRequest } as QueryGetPollRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseQueryGetPollResponse: object = {}

export const QueryGetPollResponse = {
  encode(message: QueryGetPollResponse, writer: Writer = Writer.create()): Writer {
    if (message.Poll !== undefined) {
      Poll.encode(message.Poll, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Poll = Poll.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetPollResponse {
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse
    if (object.Poll !== undefined && object.Poll !== null) {
      message.Poll = Poll.fromJSON(object.Poll)
    } else {
      message.Poll = undefined
    }
    return message
  },

  toJSON(message: QueryGetPollResponse): unknown {
    const obj: any = {}
    message.Poll !== undefined && (obj.Poll = message.Poll ? Poll.toJSON(message.Poll) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetPollResponse>): QueryGetPollResponse {
    const message = { ...baseQueryGetPollResponse } as QueryGetPollResponse
    if (object.Poll !== undefined && object.Poll !== null) {
      message.Poll = Poll.fromPartial(object.Poll)
    } else {
      message.Poll = undefined
    }
    return message
  }
}

const baseQueryAllPollRequest: object = {}

export const QueryAllPollRequest = {
  encode(message: QueryAllPollRequest, writer: Writer = Writer.create()): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPollRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.pagination = PageRequest.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryAllPollRequest {
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllPollRequest): unknown {
    const obj: any = {}
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllPollRequest>): QueryAllPollRequest {
    const message = { ...baseQueryAllPollRequest } as QueryAllPollRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryAllPollResponse: object = {}

export const QueryAllPollResponse = {
  encode(message: QueryAllPollResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.Poll) {
      Poll.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse
    message.Poll = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Poll.push(Poll.decode(reader, reader.uint32()))
          break
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryAllPollResponse {
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse
    message.Poll = []
    if (object.Poll !== undefined && object.Poll !== null) {
      for (const e of object.Poll) {
        message.Poll.push(Poll.fromJSON(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllPollResponse): unknown {
    const obj: any = {}
    if (message.Poll) {
      obj.Poll = message.Poll.map((e) => (e ? Poll.toJSON(e) : undefined))
    } else {
      obj.Poll = []
    }
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllPollResponse>): QueryAllPollResponse {
    const message = { ...baseQueryAllPollResponse } as QueryAllPollResponse
    message.Poll = []
    if (object.Poll !== undefined && object.Poll !== null) {
      for (const e of object.Poll) {
        message.Poll.push(Poll.fromPartial(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

/** Query defines the gRPC querier service. */
export interface Query {
  /** Queries a vote by id. */
  Vote(request: QueryGetVoteRequest): Promise<QueryGetVoteResponse>
  /** Queries a list of vote items. */
  VoteAll(request: QueryAllVoteRequest): Promise<QueryAllVoteResponse>
  /** Queries a poll by id. */
  Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse>
  /** Queries a list of poll items. */
  PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse>
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc
  constructor(rpc: Rpc) {
    this.rpc = rpc
  }
  Vote(request: QueryGetVoteRequest): Promise<QueryGetVoteResponse> {
    const data = QueryGetVoteRequest.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Query', 'Vote', data)
    return promise.then((data) => QueryGetVoteResponse.decode(new Reader(data)))
  }

  VoteAll(request: QueryAllVoteRequest): Promise<QueryAllVoteResponse> {
    const data = QueryAllVoteRequest.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Query', 'VoteAll', data)
    return promise.then((data) => QueryAllVoteResponse.decode(new Reader(data)))
  }

  Poll(request: QueryGetPollRequest): Promise<QueryGetPollResponse> {
    const data = QueryGetPollRequest.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Query', 'Poll', data)
    return promise.then((data) => QueryGetPollResponse.decode(new Reader(data)))
  }

  PollAll(request: QueryAllPollRequest): Promise<QueryAllPollResponse> {
    const data = QueryAllPollRequest.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Query', 'PollAll', data)
    return promise.then((data) => QueryAllPollResponse.decode(new Reader(data)))
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>
}

declare var self: any | undefined
declare var window: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis
  if (typeof self !== 'undefined') return self
  if (typeof window !== 'undefined') return window
  if (typeof global !== 'undefined') return global
  throw 'Unable to locate global object'
})()

type Builtin = Date | Function | Uint8Array | string | number | undefined
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

if (util.Long !== Long) {
  util.Long = Long as any
  configure()
}
