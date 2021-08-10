/* eslint-disable */
import * as Long from 'long';
import { util, configure, Writer, Reader } from 'protobufjs/minimal';
import { Vote } from '../voter/vote';
import { Poll } from '../voter/poll';
export const protobufPackage = 'cosmonaut.voter.voter';
const baseGenesisState = { voteCount: 0, pollCount: 0 };
export const GenesisState = {
    encode(message, writer = Writer.create()) {
        for (const v of message.voteList) {
            Vote.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.voteCount !== 0) {
            writer.uint32(32).uint64(message.voteCount);
        }
        for (const v of message.pollList) {
            Poll.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pollCount !== 0) {
            writer.uint32(16).uint64(message.pollCount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseGenesisState };
        message.voteList = [];
        message.pollList = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 3:
                    message.voteList.push(Vote.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.voteCount = longToNumber(reader.uint64());
                    break;
                case 1:
                    message.pollList.push(Poll.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pollCount = longToNumber(reader.uint64());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = { ...baseGenesisState };
        message.voteList = [];
        message.pollList = [];
        if (object.voteList !== undefined && object.voteList !== null) {
            for (const e of object.voteList) {
                message.voteList.push(Vote.fromJSON(e));
            }
        }
        if (object.voteCount !== undefined && object.voteCount !== null) {
            message.voteCount = Number(object.voteCount);
        }
        else {
            message.voteCount = 0;
        }
        if (object.pollList !== undefined && object.pollList !== null) {
            for (const e of object.pollList) {
                message.pollList.push(Poll.fromJSON(e));
            }
        }
        if (object.pollCount !== undefined && object.pollCount !== null) {
            message.pollCount = Number(object.pollCount);
        }
        else {
            message.pollCount = 0;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.voteList) {
            obj.voteList = message.voteList.map((e) => (e ? Vote.toJSON(e) : undefined));
        }
        else {
            obj.voteList = [];
        }
        message.voteCount !== undefined && (obj.voteCount = message.voteCount);
        if (message.pollList) {
            obj.pollList = message.pollList.map((e) => (e ? Poll.toJSON(e) : undefined));
        }
        else {
            obj.pollList = [];
        }
        message.pollCount !== undefined && (obj.pollCount = message.pollCount);
        return obj;
    },
    fromPartial(object) {
        const message = { ...baseGenesisState };
        message.voteList = [];
        message.pollList = [];
        if (object.voteList !== undefined && object.voteList !== null) {
            for (const e of object.voteList) {
                message.voteList.push(Vote.fromPartial(e));
            }
        }
        if (object.voteCount !== undefined && object.voteCount !== null) {
            message.voteCount = object.voteCount;
        }
        else {
            message.voteCount = 0;
        }
        if (object.pollList !== undefined && object.pollList !== null) {
            for (const e of object.pollList) {
                message.pollList.push(Poll.fromPartial(e));
            }
        }
        if (object.pollCount !== undefined && object.pollCount !== null) {
            message.pollCount = object.pollCount;
        }
        else {
            message.pollCount = 0;
        }
        return message;
    }
};
var globalThis = (() => {
    if (typeof globalThis !== 'undefined')
        return globalThis;
    if (typeof self !== 'undefined')
        return self;
    if (typeof window !== 'undefined')
        return window;
    if (typeof global !== 'undefined')
        return global;
    throw 'Unable to locate global object';
})();
function longToNumber(long) {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
    }
    return long.toNumber();
}
if (util.Long !== Long) {
    util.Long = Long;
    configure();
}
