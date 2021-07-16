/* eslint-disable */
import * as Long from 'long'
import { util, configure, Writer, Reader } from 'protobufjs/minimal'
import { Comment } from '../blog/comment'

export const protobufPackage = 'example.blog.blog'

/** GenesisState defines the blog module's genesis state. */
export interface GenesisState {
  /** this line is used by starport scaffolding # genesis/proto/state */
  commentList: Comment[]
  /** this line is used by starport scaffolding # genesis/proto/stateField */
  commentCount: number
}

const baseGenesisState: object = { commentCount: 0 }

export const GenesisState = {
  encode(message: GenesisState, writer: Writer = Writer.create()): Writer {
    for (const v of message.commentList) {
      Comment.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.commentCount !== 0) {
      writer.uint32(16).uint64(message.commentCount)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseGenesisState } as GenesisState
    message.commentList = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.commentList.push(Comment.decode(reader, reader.uint32()))
          break
        case 2:
          message.commentCount = longToNumber(reader.uint64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GenesisState {
    const message = { ...baseGenesisState } as GenesisState
    message.commentList = []
    if (object.commentList !== undefined && object.commentList !== null) {
      for (const e of object.commentList) {
        message.commentList.push(Comment.fromJSON(e))
      }
    }
    if (object.commentCount !== undefined && object.commentCount !== null) {
      message.commentCount = Number(object.commentCount)
    } else {
      message.commentCount = 0
    }
    return message
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {}
    if (message.commentList) {
      obj.commentList = message.commentList.map((e) => (e ? Comment.toJSON(e) : undefined))
    } else {
      obj.commentList = []
    }
    message.commentCount !== undefined && (obj.commentCount = message.commentCount)
    return obj
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = { ...baseGenesisState } as GenesisState
    message.commentList = []
    if (object.commentList !== undefined && object.commentList !== null) {
      for (const e of object.commentList) {
        message.commentList.push(Comment.fromPartial(e))
      }
    }
    if (object.commentCount !== undefined && object.commentCount !== null) {
      message.commentCount = object.commentCount
    } else {
      message.commentCount = 0
    }
    return message
  }
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
