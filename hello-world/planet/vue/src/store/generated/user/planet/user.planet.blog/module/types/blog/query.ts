/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal'
import * as Long from 'long'
import { TimedoutPost } from '../blog/timedout_post'
import { PageRequest, PageResponse } from '../cosmos/base/query/v1beta1/pagination'
import { SentPost } from '../blog/sent_post'
import { Post } from '../blog/post'

export const protobufPackage = 'user.planet.blog'

/** this line is used by starport scaffolding # 3 */
export interface QueryGetTimedoutPostRequest {
  id: number
}

export interface QueryGetTimedoutPostResponse {
  TimedoutPost: TimedoutPost | undefined
}

export interface QueryAllTimedoutPostRequest {
  pagination: PageRequest | undefined
}

export interface QueryAllTimedoutPostResponse {
  TimedoutPost: TimedoutPost[]
  pagination: PageResponse | undefined
}

export interface QueryGetSentPostRequest {
  id: number
}

export interface QueryGetSentPostResponse {
  SentPost: SentPost | undefined
}

export interface QueryAllSentPostRequest {
  pagination: PageRequest | undefined
}

export interface QueryAllSentPostResponse {
  SentPost: SentPost[]
  pagination: PageResponse | undefined
}

export interface QueryGetPostRequest {
  id: number
}

export interface QueryGetPostResponse {
  Post: Post | undefined
}

export interface QueryAllPostRequest {
  pagination: PageRequest | undefined
}

export interface QueryAllPostResponse {
  Post: Post[]
  pagination: PageResponse | undefined
}

const baseQueryGetTimedoutPostRequest: object = { id: 0 }

export const QueryGetTimedoutPostRequest = {
  encode(message: QueryGetTimedoutPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetTimedoutPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetTimedoutPostRequest } as QueryGetTimedoutPostRequest
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

  fromJSON(object: any): QueryGetTimedoutPostRequest {
    const message = { ...baseQueryGetTimedoutPostRequest } as QueryGetTimedoutPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: QueryGetTimedoutPostRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetTimedoutPostRequest>): QueryGetTimedoutPostRequest {
    const message = { ...baseQueryGetTimedoutPostRequest } as QueryGetTimedoutPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseQueryGetTimedoutPostResponse: object = {}

export const QueryGetTimedoutPostResponse = {
  encode(message: QueryGetTimedoutPostResponse, writer: Writer = Writer.create()): Writer {
    if (message.TimedoutPost !== undefined) {
      TimedoutPost.encode(message.TimedoutPost, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetTimedoutPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetTimedoutPostResponse } as QueryGetTimedoutPostResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.TimedoutPost = TimedoutPost.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetTimedoutPostResponse {
    const message = { ...baseQueryGetTimedoutPostResponse } as QueryGetTimedoutPostResponse
    if (object.TimedoutPost !== undefined && object.TimedoutPost !== null) {
      message.TimedoutPost = TimedoutPost.fromJSON(object.TimedoutPost)
    } else {
      message.TimedoutPost = undefined
    }
    return message
  },

  toJSON(message: QueryGetTimedoutPostResponse): unknown {
    const obj: any = {}
    message.TimedoutPost !== undefined && (obj.TimedoutPost = message.TimedoutPost ? TimedoutPost.toJSON(message.TimedoutPost) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetTimedoutPostResponse>): QueryGetTimedoutPostResponse {
    const message = { ...baseQueryGetTimedoutPostResponse } as QueryGetTimedoutPostResponse
    if (object.TimedoutPost !== undefined && object.TimedoutPost !== null) {
      message.TimedoutPost = TimedoutPost.fromPartial(object.TimedoutPost)
    } else {
      message.TimedoutPost = undefined
    }
    return message
  }
}

const baseQueryAllTimedoutPostRequest: object = {}

export const QueryAllTimedoutPostRequest = {
  encode(message: QueryAllTimedoutPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllTimedoutPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllTimedoutPostRequest } as QueryAllTimedoutPostRequest
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

  fromJSON(object: any): QueryAllTimedoutPostRequest {
    const message = { ...baseQueryAllTimedoutPostRequest } as QueryAllTimedoutPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllTimedoutPostRequest): unknown {
    const obj: any = {}
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllTimedoutPostRequest>): QueryAllTimedoutPostRequest {
    const message = { ...baseQueryAllTimedoutPostRequest } as QueryAllTimedoutPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryAllTimedoutPostResponse: object = {}

export const QueryAllTimedoutPostResponse = {
  encode(message: QueryAllTimedoutPostResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.TimedoutPost) {
      TimedoutPost.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllTimedoutPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllTimedoutPostResponse } as QueryAllTimedoutPostResponse
    message.TimedoutPost = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.TimedoutPost.push(TimedoutPost.decode(reader, reader.uint32()))
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

  fromJSON(object: any): QueryAllTimedoutPostResponse {
    const message = { ...baseQueryAllTimedoutPostResponse } as QueryAllTimedoutPostResponse
    message.TimedoutPost = []
    if (object.TimedoutPost !== undefined && object.TimedoutPost !== null) {
      for (const e of object.TimedoutPost) {
        message.TimedoutPost.push(TimedoutPost.fromJSON(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllTimedoutPostResponse): unknown {
    const obj: any = {}
    if (message.TimedoutPost) {
      obj.TimedoutPost = message.TimedoutPost.map((e) => (e ? TimedoutPost.toJSON(e) : undefined))
    } else {
      obj.TimedoutPost = []
    }
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllTimedoutPostResponse>): QueryAllTimedoutPostResponse {
    const message = { ...baseQueryAllTimedoutPostResponse } as QueryAllTimedoutPostResponse
    message.TimedoutPost = []
    if (object.TimedoutPost !== undefined && object.TimedoutPost !== null) {
      for (const e of object.TimedoutPost) {
        message.TimedoutPost.push(TimedoutPost.fromPartial(e))
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

const baseQueryGetSentPostRequest: object = { id: 0 }

export const QueryGetSentPostRequest = {
  encode(message: QueryGetSentPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetSentPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetSentPostRequest } as QueryGetSentPostRequest
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

  fromJSON(object: any): QueryGetSentPostRequest {
    const message = { ...baseQueryGetSentPostRequest } as QueryGetSentPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: QueryGetSentPostRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetSentPostRequest>): QueryGetSentPostRequest {
    const message = { ...baseQueryGetSentPostRequest } as QueryGetSentPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseQueryGetSentPostResponse: object = {}

export const QueryGetSentPostResponse = {
  encode(message: QueryGetSentPostResponse, writer: Writer = Writer.create()): Writer {
    if (message.SentPost !== undefined) {
      SentPost.encode(message.SentPost, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetSentPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetSentPostResponse } as QueryGetSentPostResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.SentPost = SentPost.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetSentPostResponse {
    const message = { ...baseQueryGetSentPostResponse } as QueryGetSentPostResponse
    if (object.SentPost !== undefined && object.SentPost !== null) {
      message.SentPost = SentPost.fromJSON(object.SentPost)
    } else {
      message.SentPost = undefined
    }
    return message
  },

  toJSON(message: QueryGetSentPostResponse): unknown {
    const obj: any = {}
    message.SentPost !== undefined && (obj.SentPost = message.SentPost ? SentPost.toJSON(message.SentPost) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetSentPostResponse>): QueryGetSentPostResponse {
    const message = { ...baseQueryGetSentPostResponse } as QueryGetSentPostResponse
    if (object.SentPost !== undefined && object.SentPost !== null) {
      message.SentPost = SentPost.fromPartial(object.SentPost)
    } else {
      message.SentPost = undefined
    }
    return message
  }
}

const baseQueryAllSentPostRequest: object = {}

export const QueryAllSentPostRequest = {
  encode(message: QueryAllSentPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllSentPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllSentPostRequest } as QueryAllSentPostRequest
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

  fromJSON(object: any): QueryAllSentPostRequest {
    const message = { ...baseQueryAllSentPostRequest } as QueryAllSentPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllSentPostRequest): unknown {
    const obj: any = {}
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllSentPostRequest>): QueryAllSentPostRequest {
    const message = { ...baseQueryAllSentPostRequest } as QueryAllSentPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryAllSentPostResponse: object = {}

export const QueryAllSentPostResponse = {
  encode(message: QueryAllSentPostResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.SentPost) {
      SentPost.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllSentPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllSentPostResponse } as QueryAllSentPostResponse
    message.SentPost = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.SentPost.push(SentPost.decode(reader, reader.uint32()))
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

  fromJSON(object: any): QueryAllSentPostResponse {
    const message = { ...baseQueryAllSentPostResponse } as QueryAllSentPostResponse
    message.SentPost = []
    if (object.SentPost !== undefined && object.SentPost !== null) {
      for (const e of object.SentPost) {
        message.SentPost.push(SentPost.fromJSON(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllSentPostResponse): unknown {
    const obj: any = {}
    if (message.SentPost) {
      obj.SentPost = message.SentPost.map((e) => (e ? SentPost.toJSON(e) : undefined))
    } else {
      obj.SentPost = []
    }
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllSentPostResponse>): QueryAllSentPostResponse {
    const message = { ...baseQueryAllSentPostResponse } as QueryAllSentPostResponse
    message.SentPost = []
    if (object.SentPost !== undefined && object.SentPost !== null) {
      for (const e of object.SentPost) {
        message.SentPost.push(SentPost.fromPartial(e))
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

const baseQueryGetPostRequest: object = { id: 0 }

export const QueryGetPostRequest = {
  encode(message: QueryGetPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetPostRequest } as QueryGetPostRequest
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

  fromJSON(object: any): QueryGetPostRequest {
    const message = { ...baseQueryGetPostRequest } as QueryGetPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: QueryGetPostRequest): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetPostRequest>): QueryGetPostRequest {
    const message = { ...baseQueryGetPostRequest } as QueryGetPostRequest
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseQueryGetPostResponse: object = {}

export const QueryGetPostResponse = {
  encode(message: QueryGetPostResponse, writer: Writer = Writer.create()): Writer {
    if (message.Post !== undefined) {
      Post.encode(message.Post, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryGetPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryGetPostResponse } as QueryGetPostResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Post = Post.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): QueryGetPostResponse {
    const message = { ...baseQueryGetPostResponse } as QueryGetPostResponse
    if (object.Post !== undefined && object.Post !== null) {
      message.Post = Post.fromJSON(object.Post)
    } else {
      message.Post = undefined
    }
    return message
  },

  toJSON(message: QueryGetPostResponse): unknown {
    const obj: any = {}
    message.Post !== undefined && (obj.Post = message.Post ? Post.toJSON(message.Post) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryGetPostResponse>): QueryGetPostResponse {
    const message = { ...baseQueryGetPostResponse } as QueryGetPostResponse
    if (object.Post !== undefined && object.Post !== null) {
      message.Post = Post.fromPartial(object.Post)
    } else {
      message.Post = undefined
    }
    return message
  }
}

const baseQueryAllPostRequest: object = {}

export const QueryAllPostRequest = {
  encode(message: QueryAllPostRequest, writer: Writer = Writer.create()): Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPostRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllPostRequest } as QueryAllPostRequest
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

  fromJSON(object: any): QueryAllPostRequest {
    const message = { ...baseQueryAllPostRequest } as QueryAllPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllPostRequest): unknown {
    const obj: any = {}
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageRequest.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllPostRequest>): QueryAllPostRequest {
    const message = { ...baseQueryAllPostRequest } as QueryAllPostRequest
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageRequest.fromPartial(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  }
}

const baseQueryAllPostResponse: object = {}

export const QueryAllPostResponse = {
  encode(message: QueryAllPostResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.Post) {
      Post.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): QueryAllPostResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseQueryAllPostResponse } as QueryAllPostResponse
    message.Post = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Post.push(Post.decode(reader, reader.uint32()))
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

  fromJSON(object: any): QueryAllPostResponse {
    const message = { ...baseQueryAllPostResponse } as QueryAllPostResponse
    message.Post = []
    if (object.Post !== undefined && object.Post !== null) {
      for (const e of object.Post) {
        message.Post.push(Post.fromJSON(e))
      }
    }
    if (object.pagination !== undefined && object.pagination !== null) {
      message.pagination = PageResponse.fromJSON(object.pagination)
    } else {
      message.pagination = undefined
    }
    return message
  },

  toJSON(message: QueryAllPostResponse): unknown {
    const obj: any = {}
    if (message.Post) {
      obj.Post = message.Post.map((e) => (e ? Post.toJSON(e) : undefined))
    } else {
      obj.Post = []
    }
    message.pagination !== undefined && (obj.pagination = message.pagination ? PageResponse.toJSON(message.pagination) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<QueryAllPostResponse>): QueryAllPostResponse {
    const message = { ...baseQueryAllPostResponse } as QueryAllPostResponse
    message.Post = []
    if (object.Post !== undefined && object.Post !== null) {
      for (const e of object.Post) {
        message.Post.push(Post.fromPartial(e))
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
  /** Queries a timedoutPost by id. */
  TimedoutPost(request: QueryGetTimedoutPostRequest): Promise<QueryGetTimedoutPostResponse>
  /** Queries a list of timedoutPost items. */
  TimedoutPostAll(request: QueryAllTimedoutPostRequest): Promise<QueryAllTimedoutPostResponse>
  /** Queries a sentPost by id. */
  SentPost(request: QueryGetSentPostRequest): Promise<QueryGetSentPostResponse>
  /** Queries a list of sentPost items. */
  SentPostAll(request: QueryAllSentPostRequest): Promise<QueryAllSentPostResponse>
  /** Queries a post by id. */
  Post(request: QueryGetPostRequest): Promise<QueryGetPostResponse>
  /** Queries a list of post items. */
  PostAll(request: QueryAllPostRequest): Promise<QueryAllPostResponse>
}

export class QueryClientImpl implements Query {
  private readonly rpc: Rpc
  constructor(rpc: Rpc) {
    this.rpc = rpc
  }
  TimedoutPost(request: QueryGetTimedoutPostRequest): Promise<QueryGetTimedoutPostResponse> {
    const data = QueryGetTimedoutPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'TimedoutPost', data)
    return promise.then((data) => QueryGetTimedoutPostResponse.decode(new Reader(data)))
  }

  TimedoutPostAll(request: QueryAllTimedoutPostRequest): Promise<QueryAllTimedoutPostResponse> {
    const data = QueryAllTimedoutPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'TimedoutPostAll', data)
    return promise.then((data) => QueryAllTimedoutPostResponse.decode(new Reader(data)))
  }

  SentPost(request: QueryGetSentPostRequest): Promise<QueryGetSentPostResponse> {
    const data = QueryGetSentPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'SentPost', data)
    return promise.then((data) => QueryGetSentPostResponse.decode(new Reader(data)))
  }

  SentPostAll(request: QueryAllSentPostRequest): Promise<QueryAllSentPostResponse> {
    const data = QueryAllSentPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'SentPostAll', data)
    return promise.then((data) => QueryAllSentPostResponse.decode(new Reader(data)))
  }

  Post(request: QueryGetPostRequest): Promise<QueryGetPostResponse> {
    const data = QueryGetPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'Post', data)
    return promise.then((data) => QueryGetPostResponse.decode(new Reader(data)))
  }

  PostAll(request: QueryAllPostRequest): Promise<QueryAllPostResponse> {
    const data = QueryAllPostRequest.encode(request).finish()
    const promise = this.rpc.request('user.planet.blog.Query', 'PostAll', data)
    return promise.then((data) => QueryAllPostResponse.decode(new Reader(data)))
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
