/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal'
import * as Long from 'long'

export const protobufPackage = 'cosmonaut.voter.voter'

/** this line is used by starport scaffolding # proto/tx/message */
export interface MsgCreateVote {
  creator: string
  pollID: string
  option: string
}

export interface MsgCreateVoteResponse {
  id: number
}

export interface MsgUpdateVote {
  creator: string
  id: number
  pollID: string
  option: string
}

export interface MsgUpdateVoteResponse {}

export interface MsgDeleteVote {
  creator: string
  id: number
}

export interface MsgDeleteVoteResponse {}

export interface MsgCreatePoll {
  creator: string
  title: string
  options: string[]
}

export interface MsgCreatePollResponse {
  id: number
}

export interface MsgUpdatePoll {
  creator: string
  id: number
  title: string
  options: string[]
}

export interface MsgUpdatePollResponse {}

export interface MsgDeletePoll {
  creator: string
  id: number
}

export interface MsgDeletePollResponse {}

const baseMsgCreateVote: object = { creator: '', pollID: '', option: '' }

export const MsgCreateVote = {
  encode(message: MsgCreateVote, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.pollID !== '') {
      writer.uint32(18).string(message.pollID)
    }
    if (message.option !== '') {
      writer.uint32(26).string(message.option)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateVote {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateVote } as MsgCreateVote
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string()
          break
        case 2:
          message.pollID = reader.string()
          break
        case 3:
          message.option = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreateVote {
    const message = { ...baseMsgCreateVote } as MsgCreateVote
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator)
    } else {
      message.creator = ''
    }
    if (object.pollID !== undefined && object.pollID !== null) {
      message.pollID = String(object.pollID)
    } else {
      message.pollID = ''
    }
    if (object.option !== undefined && object.option !== null) {
      message.option = String(object.option)
    } else {
      message.option = ''
    }
    return message
  },

  toJSON(message: MsgCreateVote): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.pollID !== undefined && (obj.pollID = message.pollID)
    message.option !== undefined && (obj.option = message.option)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateVote>): MsgCreateVote {
    const message = { ...baseMsgCreateVote } as MsgCreateVote
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator
    } else {
      message.creator = ''
    }
    if (object.pollID !== undefined && object.pollID !== null) {
      message.pollID = object.pollID
    } else {
      message.pollID = ''
    }
    if (object.option !== undefined && object.option !== null) {
      message.option = object.option
    } else {
      message.option = ''
    }
    return message
  }
}

const baseMsgCreateVoteResponse: object = { id: 0 }

export const MsgCreateVoteResponse = {
  encode(message: MsgCreateVoteResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreateVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreateVoteResponse } as MsgCreateVoteResponse
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

  fromJSON(object: any): MsgCreateVoteResponse {
    const message = { ...baseMsgCreateVoteResponse } as MsgCreateVoteResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreateVoteResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreateVoteResponse>): MsgCreateVoteResponse {
    const message = { ...baseMsgCreateVoteResponse } as MsgCreateVoteResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgUpdateVote: object = { creator: '', id: 0, pollID: '', option: '' }

export const MsgUpdateVote = {
  encode(message: MsgUpdateVote, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    if (message.pollID !== '') {
      writer.uint32(26).string(message.pollID)
    }
    if (message.option !== '') {
      writer.uint32(34).string(message.option)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateVote {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdateVote } as MsgUpdateVote
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
          message.pollID = reader.string()
          break
        case 4:
          message.option = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgUpdateVote {
    const message = { ...baseMsgUpdateVote } as MsgUpdateVote
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
    if (object.pollID !== undefined && object.pollID !== null) {
      message.pollID = String(object.pollID)
    } else {
      message.pollID = ''
    }
    if (object.option !== undefined && object.option !== null) {
      message.option = String(object.option)
    } else {
      message.option = ''
    }
    return message
  },

  toJSON(message: MsgUpdateVote): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    message.pollID !== undefined && (obj.pollID = message.pollID)
    message.option !== undefined && (obj.option = message.option)
    return obj
  },

  fromPartial(object: DeepPartial<MsgUpdateVote>): MsgUpdateVote {
    const message = { ...baseMsgUpdateVote } as MsgUpdateVote
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
    if (object.pollID !== undefined && object.pollID !== null) {
      message.pollID = object.pollID
    } else {
      message.pollID = ''
    }
    if (object.option !== undefined && object.option !== null) {
      message.option = object.option
    } else {
      message.option = ''
    }
    return message
  }
}

const baseMsgUpdateVoteResponse: object = {}

export const MsgUpdateVoteResponse = {
  encode(_: MsgUpdateVoteResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdateVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdateVoteResponse } as MsgUpdateVoteResponse
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

  fromJSON(_: any): MsgUpdateVoteResponse {
    const message = { ...baseMsgUpdateVoteResponse } as MsgUpdateVoteResponse
    return message
  },

  toJSON(_: MsgUpdateVoteResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgUpdateVoteResponse>): MsgUpdateVoteResponse {
    const message = { ...baseMsgUpdateVoteResponse } as MsgUpdateVoteResponse
    return message
  }
}

const baseMsgDeleteVote: object = { creator: '', id: 0 }

export const MsgDeleteVote = {
  encode(message: MsgDeleteVote, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteVote {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeleteVote } as MsgDeleteVote
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

  fromJSON(object: any): MsgDeleteVote {
    const message = { ...baseMsgDeleteVote } as MsgDeleteVote
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

  toJSON(message: MsgDeleteVote): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgDeleteVote>): MsgDeleteVote {
    const message = { ...baseMsgDeleteVote } as MsgDeleteVote
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

const baseMsgDeleteVoteResponse: object = {}

export const MsgDeleteVoteResponse = {
  encode(_: MsgDeleteVoteResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeleteVoteResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeleteVoteResponse } as MsgDeleteVoteResponse
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

  fromJSON(_: any): MsgDeleteVoteResponse {
    const message = { ...baseMsgDeleteVoteResponse } as MsgDeleteVoteResponse
    return message
  },

  toJSON(_: MsgDeleteVoteResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgDeleteVoteResponse>): MsgDeleteVoteResponse {
    const message = { ...baseMsgDeleteVoteResponse } as MsgDeleteVoteResponse
    return message
  }
}

const baseMsgCreatePoll: object = { creator: '', title: '', options: '' }

export const MsgCreatePoll = {
  encode(message: MsgCreatePoll, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.title !== '') {
      writer.uint32(18).string(message.title)
    }
    for (const v of message.options) {
      writer.uint32(26).string(v!)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreatePoll {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreatePoll } as MsgCreatePoll
    message.options = []
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
          message.options.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgCreatePoll {
    const message = { ...baseMsgCreatePoll } as MsgCreatePoll
    message.options = []
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
    if (object.options !== undefined && object.options !== null) {
      for (const e of object.options) {
        message.options.push(String(e))
      }
    }
    return message
  },

  toJSON(message: MsgCreatePoll): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.title !== undefined && (obj.title = message.title)
    if (message.options) {
      obj.options = message.options.map((e) => e)
    } else {
      obj.options = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreatePoll>): MsgCreatePoll {
    const message = { ...baseMsgCreatePoll } as MsgCreatePoll
    message.options = []
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
    if (object.options !== undefined && object.options !== null) {
      for (const e of object.options) {
        message.options.push(e)
      }
    }
    return message
  }
}

const baseMsgCreatePollResponse: object = { id: 0 }

export const MsgCreatePollResponse = {
  encode(message: MsgCreatePollResponse, writer: Writer = Writer.create()): Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgCreatePollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgCreatePollResponse } as MsgCreatePollResponse
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

  fromJSON(object: any): MsgCreatePollResponse {
    const message = { ...baseMsgCreatePollResponse } as MsgCreatePollResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = Number(object.id)
    } else {
      message.id = 0
    }
    return message
  },

  toJSON(message: MsgCreatePollResponse): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgCreatePollResponse>): MsgCreatePollResponse {
    const message = { ...baseMsgCreatePollResponse } as MsgCreatePollResponse
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id
    } else {
      message.id = 0
    }
    return message
  }
}

const baseMsgUpdatePoll: object = { creator: '', id: 0, title: '', options: '' }

export const MsgUpdatePoll = {
  encode(message: MsgUpdatePoll, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    if (message.title !== '') {
      writer.uint32(26).string(message.title)
    }
    for (const v of message.options) {
      writer.uint32(34).string(v!)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdatePoll {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdatePoll } as MsgUpdatePoll
    message.options = []
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
          message.title = reader.string()
          break
        case 4:
          message.options.push(reader.string())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgUpdatePoll {
    const message = { ...baseMsgUpdatePoll } as MsgUpdatePoll
    message.options = []
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
    if (object.title !== undefined && object.title !== null) {
      message.title = String(object.title)
    } else {
      message.title = ''
    }
    if (object.options !== undefined && object.options !== null) {
      for (const e of object.options) {
        message.options.push(String(e))
      }
    }
    return message
  },

  toJSON(message: MsgUpdatePoll): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    message.title !== undefined && (obj.title = message.title)
    if (message.options) {
      obj.options = message.options.map((e) => e)
    } else {
      obj.options = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<MsgUpdatePoll>): MsgUpdatePoll {
    const message = { ...baseMsgUpdatePoll } as MsgUpdatePoll
    message.options = []
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
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title
    } else {
      message.title = ''
    }
    if (object.options !== undefined && object.options !== null) {
      for (const e of object.options) {
        message.options.push(e)
      }
    }
    return message
  }
}

const baseMsgUpdatePollResponse: object = {}

export const MsgUpdatePollResponse = {
  encode(_: MsgUpdatePollResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgUpdatePollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUpdatePollResponse } as MsgUpdatePollResponse
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

  fromJSON(_: any): MsgUpdatePollResponse {
    const message = { ...baseMsgUpdatePollResponse } as MsgUpdatePollResponse
    return message
  },

  toJSON(_: MsgUpdatePollResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgUpdatePollResponse>): MsgUpdatePollResponse {
    const message = { ...baseMsgUpdatePollResponse } as MsgUpdatePollResponse
    return message
  }
}

const baseMsgDeletePoll: object = { creator: '', id: 0 }

export const MsgDeletePoll = {
  encode(message: MsgDeletePoll, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator)
    }
    if (message.id !== 0) {
      writer.uint32(16).uint64(message.id)
    }
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeletePoll {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeletePoll } as MsgDeletePoll
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

  fromJSON(object: any): MsgDeletePoll {
    const message = { ...baseMsgDeletePoll } as MsgDeletePoll
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

  toJSON(message: MsgDeletePoll): unknown {
    const obj: any = {}
    message.creator !== undefined && (obj.creator = message.creator)
    message.id !== undefined && (obj.id = message.id)
    return obj
  },

  fromPartial(object: DeepPartial<MsgDeletePoll>): MsgDeletePoll {
    const message = { ...baseMsgDeletePoll } as MsgDeletePoll
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

const baseMsgDeletePollResponse: object = {}

export const MsgDeletePollResponse = {
  encode(_: MsgDeletePollResponse, writer: Writer = Writer.create()): Writer {
    return writer
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDeletePollResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDeletePollResponse } as MsgDeletePollResponse
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

  fromJSON(_: any): MsgDeletePollResponse {
    const message = { ...baseMsgDeletePollResponse } as MsgDeletePollResponse
    return message
  },

  toJSON(_: MsgDeletePollResponse): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<MsgDeletePollResponse>): MsgDeletePollResponse {
    const message = { ...baseMsgDeletePollResponse } as MsgDeletePollResponse
    return message
  }
}

/** Msg defines the Msg service. */
export interface Msg {
  /** this line is used by starport scaffolding # proto/tx/rpc */
  CreateVote(request: MsgCreateVote): Promise<MsgCreateVoteResponse>
  UpdateVote(request: MsgUpdateVote): Promise<MsgUpdateVoteResponse>
  DeleteVote(request: MsgDeleteVote): Promise<MsgDeleteVoteResponse>
  CreatePoll(request: MsgCreatePoll): Promise<MsgCreatePollResponse>
  UpdatePoll(request: MsgUpdatePoll): Promise<MsgUpdatePollResponse>
  DeletePoll(request: MsgDeletePoll): Promise<MsgDeletePollResponse>
}

export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc
  constructor(rpc: Rpc) {
    this.rpc = rpc
  }
  CreateVote(request: MsgCreateVote): Promise<MsgCreateVoteResponse> {
    const data = MsgCreateVote.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'CreateVote', data)
    return promise.then((data) => MsgCreateVoteResponse.decode(new Reader(data)))
  }

  UpdateVote(request: MsgUpdateVote): Promise<MsgUpdateVoteResponse> {
    const data = MsgUpdateVote.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'UpdateVote', data)
    return promise.then((data) => MsgUpdateVoteResponse.decode(new Reader(data)))
  }

  DeleteVote(request: MsgDeleteVote): Promise<MsgDeleteVoteResponse> {
    const data = MsgDeleteVote.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'DeleteVote', data)
    return promise.then((data) => MsgDeleteVoteResponse.decode(new Reader(data)))
  }

  CreatePoll(request: MsgCreatePoll): Promise<MsgCreatePollResponse> {
    const data = MsgCreatePoll.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'CreatePoll', data)
    return promise.then((data) => MsgCreatePollResponse.decode(new Reader(data)))
  }

  UpdatePoll(request: MsgUpdatePoll): Promise<MsgUpdatePollResponse> {
    const data = MsgUpdatePoll.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'UpdatePoll', data)
    return promise.then((data) => MsgUpdatePollResponse.decode(new Reader(data)))
  }

  DeletePoll(request: MsgDeletePoll): Promise<MsgDeletePollResponse> {
    const data = MsgDeletePoll.encode(request).finish()
    const promise = this.rpc.request('cosmonaut.voter.voter.Msg', 'DeletePoll', data)
    return promise.then((data) => MsgDeletePollResponse.decode(new Reader(data)))
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
