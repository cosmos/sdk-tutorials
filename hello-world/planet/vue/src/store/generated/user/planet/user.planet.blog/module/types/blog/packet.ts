/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal'

export const protobufPackage = 'user.planet.blog'

export interface BlogPacketData {
  noData: NoData | undefined
  /** this line is used by starport scaffolding # ibc/packet/proto/field */
  ibcPostPacket: IbcPostPacketData | undefined
}

export interface NoData {}

/**
 * this line is used by starport scaffolding # ibc/packet/proto/message
 * IbcPostPacketData defines a struct for the packet payload
 */
export interface IbcPostPacketData {
  title: string
  content: string
}

/** IbcPostPacketAck defines a struct for the packet acknowledgment */
export interface IbcPostPacketAck {
  postID: string
}

const baseBlogPacketData: object = {}

export const BlogPacketData = {
  encode(message: BlogPacketData, writer: Writer = Writer.create()): Writer {
    if (message.noData !== undefined) {
      NoData.encode(message.noData, writer.uint32(10).fork()).ldelim()
    }
    if (message.ibcPostPacket !== undefined) {
      IbcPostPacketData.encode(message.ibcPostPacket, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): BlogPacketData {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseBlogPacketData } as BlogPacketData
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.noData = NoData.decode(reader, reader.uint32())
          break
        case 2:
          message.ibcPostPacket = IbcPostPacketData.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): BlogPacketData {
    const message = { ...baseBlogPacketData } as BlogPacketData
    if (object.noData !== undefined && object.noData !== null) {
      message.noData = NoData.fromJSON(object.noData)
    } else {
      message.noData = undefined
    }
    if (object.ibcPostPacket !== undefined && object.ibcPostPacket !== null) {
      message.ibcPostPacket = IbcPostPacketData.fromJSON(object.ibcPostPacket)
    } else {
      message.ibcPostPacket = undefined
    }
    return message
  },

  toJSON(message: BlogPacketData): unknown {
    const obj: any = {}
    message.noData !== undefined && (obj.noData = message.noData ? NoData.toJSON(message.noData) : undefined)
    message.ibcPostPacket !== undefined && (obj.ibcPostPacket = message.ibcPostPacket ? IbcPostPacketData.toJSON(message.ibcPostPacket) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<BlogPacketData>): BlogPacketData {
    const message = { ...baseBlogPacketData } as BlogPacketData
    if (object.noData !== undefined && object.noData !== null) {
      message.noData = NoData.fromPartial(object.noData)
    } else {
      message.noData = undefined
    }
    if (object.ibcPostPacket !== undefined && object.ibcPostPacket !== null) {
      message.ibcPostPacket = IbcPostPacketData.fromPartial(object.ibcPostPacket)
    } else {
      message.ibcPostPacket = undefined
    }
    return message
  }
}

const baseNoData: object = {}

export const NoData = {
  encode(_: NoData, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): NoData {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseNoData } as NoData
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

  fromJSON(_: any): NoData {
    const message = { ...baseNoData } as NoData
    return message
  },

  toJSON(_: NoData): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<NoData>): NoData {
    const message = { ...baseNoData } as NoData
    return message
  }
}

const baseIbcPostPacketData: object = { title: '', content: '' }

export const IbcPostPacketData = {
  encode(message: IbcPostPacketData, writer: Writer = Writer.create()): Writer {
    if (message.title !== '') {
      writer.uint32(10).string(message.title)
    }
    if (message.content !== '') {
      writer.uint32(18).string(message.content)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): IbcPostPacketData {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseIbcPostPacketData } as IbcPostPacketData
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string()
          break
        case 2:
          message.content = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): IbcPostPacketData {
    const message = { ...baseIbcPostPacketData } as IbcPostPacketData
    if (object.title !== undefined && object.title !== null) {
      message.title = String(object.title)
    } else {
      message.title = ''
    }
    if (object.content !== undefined && object.content !== null) {
      message.content = String(object.content)
    } else {
      message.content = ''
    }
    return message
  },

  toJSON(message: IbcPostPacketData): unknown {
    const obj: any = {}
    message.title !== undefined && (obj.title = message.title)
    message.content !== undefined && (obj.content = message.content)
    return obj
  },

  fromPartial(object: DeepPartial<IbcPostPacketData>): IbcPostPacketData {
    const message = { ...baseIbcPostPacketData } as IbcPostPacketData
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title
    } else {
      message.title = ''
    }
    if (object.content !== undefined && object.content !== null) {
      message.content = object.content
    } else {
      message.content = ''
    }
    return message
  }
}

const baseIbcPostPacketAck: object = { postID: '' }

export const IbcPostPacketAck = {
  encode(message: IbcPostPacketAck, writer: Writer = Writer.create()): Writer {
    if (message.postID !== '') {
      writer.uint32(10).string(message.postID)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): IbcPostPacketAck {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseIbcPostPacketAck } as IbcPostPacketAck
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.postID = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): IbcPostPacketAck {
    const message = { ...baseIbcPostPacketAck } as IbcPostPacketAck
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = String(object.postID)
    } else {
      message.postID = ''
    }
    return message
  },

  toJSON(message: IbcPostPacketAck): unknown {
    const obj: any = {}
    message.postID !== undefined && (obj.postID = message.postID)
    return obj
  },

  fromPartial(object: DeepPartial<IbcPostPacketAck>): IbcPostPacketAck {
    const message = { ...baseIbcPostPacketAck } as IbcPostPacketAck
    if (object.postID !== undefined && object.postID !== null) {
      message.postID = object.postID
    } else {
      message.postID = ''
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
