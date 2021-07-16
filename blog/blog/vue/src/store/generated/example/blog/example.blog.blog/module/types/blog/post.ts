/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal'

export const protobufPackage = 'example.blog.blog'

export interface Post {
  creator: string
  id: string
  title: string
  body: string
}

export interface MsgCreatePost {
  creator: string
  title: string
  body: string
}

const basePost: object = { creator: '', id: '', title: '', body: '' }

export const Post = {
  encode(message: Post, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== '') {
      writer.uint32(18).string(message.id)
    }
    if (message.title !== '') {
      writer.uint32(26).string(message.title)
    }
    if (message.body !== '') {
      writer.uint32(34).string(message.body)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): Post {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePost } as Post
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.id = reader.string()
          break
        case 3:
          message.title = reader.string()
          break
        case 4:
          message.body = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Post {
    const message = { ...basePost } as Post
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = String(object.id)
    } else {
      message.id = ''
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = String(object.title)
    } else {
      message.title = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = String(object.body)
    } else {
      message.body = ''
    }
    return message
  },

  toJSON(message: Post): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    message.title !== undefined && (obj.title = message.title)
    message.body !== undefined && (obj.body = message.body)
    return obj
  },

  fromPartial(object: DeepPartial<Post>): Post {
    const message = { ...basePost } as Post
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = ''
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title
    } else {
      message.title = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = object.body
    } else {
      message.body = ''
    }
    return message
  }
}

const baseMsgCreatePost: object = { creator: '', title: '', body: '' }

export const MsgCreatePost = {
  encode(message: MsgCreatePost, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.title !== '') {
      writer.uint32(18).string(message.title)
    }
    if (message.body !== '') {
      writer.uint32(26).string(message.body)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreatePost {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreatePost } as MsgCreatePost
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.title = reader.string()
          break
        case 3:
          message.body = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreatePost {
    const message = { ...baseMsgCreatePost } as MsgCreatePost
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = String(object.title)
    } else {
      message.title = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = String(object.body)
    } else {
      message.body = ''
    }
    return message
  },

  toJSON(message: MsgCreatePost): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.title !== undefined && (obj.title = message.title)
    message.body !== undefined && (obj.body = message.body)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreatePost>): MsgCreatePost {
    const message = { ...baseMsgCreatePost } as MsgCreatePost
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title
    } else {
      message.title = ''
    }
    if (object.body !== undefined && object.body !== null) {
      message.body = object.body
    } else {
      message.body = ''
    }
    return message
  }
}

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
