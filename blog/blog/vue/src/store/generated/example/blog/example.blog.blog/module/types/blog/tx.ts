/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal'
import * as Long from 'long'

export const protobufPackage = 'example.blog.blog'

/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreateComment {
  creator: string
  body: string
  postID: string
}

export interface MsgCreateCommentResponse {
  id: number
}

export interface MsgUpdateComment {
  creator: string
  id: number
  body: string
  postID: string
}

export interface MsgUpdateCommentResponse {}

export interface MsgDeleteComment {
  creator: string
  id: number
}

export interface MsgDeleteCommentResponse {}

const baseMsgCreateComment: object = { creator: '', body: '', postID: '' }

export const MsgCreateComment = {
  encode(message: MsgCreateComment, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.body !== '') {
      writer.uint32(18).string(message.body)
    }
    if (message.postID !== '') {
      writer.uint32(26).string(message.postID)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateComment {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateComment } as MsgCreateComment
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.body = reader.string()
          break
        case 3:
          message.postID = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateComment {
    const message = { ...baseMsgCreateComment } as MsgCreateComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = String(object.body)
    } else {
      message.body = ''
    }
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = String(object.postID)
    } else {
      message.postID = ''
    }
    return message
  },

  toJSON(message: MsgCreateComment): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.body !== undefined && (obj.body = message.body)
    message.postID !== undefined && (obj.postID = message.postID)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateComment>): MsgCreateComment {
    const message = { ...baseMsgCreateComment } as MsgCreateComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = object.body
    } else {
      message.body = ''
    }
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = object.postID
    } else {
      message.postID = ''
    }
    return message
  }
}

const baseMsgCreateCommentResponse: object = { id: 0 }

export const MsgCreateCommentResponse = {
  encode(message: MsgCreateCommentResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateCommentResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateCommentResponse } as MsgCreateCommentResponse
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

  fromJSON(object: any): MsgCreateCommentResponse {
    const message = { ...baseMsgCreateCommentResponse } as MsgCreateCommentResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreateCommentResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateCommentResponse>): MsgCreateCommentResponse {
    const message = { ...baseMsgCreateCommentResponse } as MsgCreateCommentResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgUpdateComment: object = { creator: '', id: 0, body: '', postID: '' }

export const MsgUpdateComment = {
  encode(message: MsgUpdateComment, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    if (message.body !== '') {
      writer.uint32(26).string(message.body)
    }
    if (message.postID !== '') {
      writer.uint32(34).string(message.postID)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateComment {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdateComment } as MsgUpdateComment
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.id = longToNumber(reader.uint64() as Long)
          break
        case 3:
          message.body = reader.string()
          break
        case 4:
          message.postID = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgUpdateComment {
    const message = { ...baseMsgUpdateComment } as MsgUpdateComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = String(object.body)
    } else {
      message.body = ''
    }
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = String(object.postID)
    } else {
      message.postID = ''
    }
    return message
  },

  toJSON(message: MsgUpdateComment): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    message.body !== undefined && (obj.body = message.body)
    message.postID !== undefined && (obj.postID = message.postID)
    return obj
  },

  fromPartial(object: DeepPartial<MsgUpdateComment>): MsgUpdateComment {
    const message = { ...baseMsgUpdateComment } as MsgUpdateComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = object.body
    } else {
      message.body = ''
    }
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = object.postID
    } else {
      message.postID = ''
    }
    return message
  }
}

const baseMsgUpdateCommentResponse: object = {}

export const MsgUpdateCommentResponse = {
  encode(_: MsgUpdateCommentResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateCommentResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdateCommentResponse } as MsgUpdateCommentResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): MsgUpdateCommentResponse {
    const message = { ...baseMsgUpdateCommentResponse } as MsgUpdateCommentResponse
    return message
  },

  toJSON(_: MsgUpdateCommentResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgUpdateCommentResponse>): MsgUpdateCommentResponse {
    const message = { ...baseMsgUpdateCommentResponse } as MsgUpdateCommentResponse
    return message
  }
}

const baseMsgDeleteComment: object = { creator: '', id: 0 }

export const MsgDeleteComment = {
  encode(message: MsgDeleteComment, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteComment {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeleteComment } as MsgDeleteComment
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.id = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgDeleteComment {
    const message = { ...baseMsgDeleteComment } as MsgDeleteComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgDeleteComment): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgDeleteComment>): MsgDeleteComment {
    const message = { ...baseMsgDeleteComment } as MsgDeleteComment
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgDeleteCommentResponse: object = {}

export const MsgDeleteCommentResponse = {
  encode(_: MsgDeleteCommentResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteCommentResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeleteCommentResponse } as MsgDeleteCommentResponse
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): MsgDeleteCommentResponse {
    const message = { ...baseMsgDeleteCommentResponse } as MsgDeleteCommentResponse
    return message
  },

  toJSON(_: MsgDeleteCommentResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgDeleteCommentResponse>): MsgDeleteCommentResponse {
    const message = { ...baseMsgDeleteCommentResponse } as MsgDeleteCommentResponse
    return message
  }
}

/** Msg defines the Msg service. */
export interface Msg {
  /** this line is used by starport scaffolding # proto/tx/rpc */
  CreateComment(request: MsgCreateComment): Promise<MsgCreateCommentResponse>
  UpdateComment(request: MsgUpdateComment): Promise<MsgUpdateCommentResponse>
  DeleteComment(request: MsgDeleteComment): Promise<MsgDeleteCommentResponse>
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc
  constructor(rpc: Rpc) {
    this.rpc = rpc
  }
  CreateComment(request: MsgCreateComment): Promise<MsgCreateCommentResponse> {
    const data = MsgCreateComment.encode(request).finish()
    const promise = this.rpc.request('example.blog.blog.Msg', 'CreateComment', data)
    return promise.then((data) => MsgCreateCommentResponse.decode(new Reader(data)))
  }

  UpdateComment(request: MsgUpdateComment): Promise<MsgUpdateCommentResponse> {
    const data = MsgUpdateComment.encode(request).finish()
    const promise = this.rpc.request('example.blog.blog.Msg', 'UpdateComment', data)
    return promise.then((data) => MsgUpdateCommentResponse.decode(new Reader(data)))
  }

  DeleteComment(request: MsgDeleteComment): Promise<MsgDeleteCommentResponse> {
    const data = MsgDeleteComment.encode(request).finish()
    const promise = this.rpc.request('example.blog.blog.Msg', 'DeleteComment', data)
    return promise.then((data) => MsgDeleteCommentResponse.decode(new Reader(data)))
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
