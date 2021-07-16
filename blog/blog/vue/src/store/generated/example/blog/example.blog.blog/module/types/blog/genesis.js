/* eslint-disable */
import * as Long from 'long';
import { util, configure, Writer, Reader } from 'protobufjs/minimal';
import { Comment } from '../blog/comment';
export const protobufPackage = 'example.blog.blog';
const baseGenesisState = { commentCount: 0 };
export const GenesisState = {
    encode(message, writer = Writer.create()) {
        for (const v of message.commentList) {
            Comment.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.commentCount !== 0) {
            writer.uint32(16).uint64(message.commentCount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseGenesisState };
        message.commentList = [];
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.commentList.push(Comment.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.commentCount = longToNumber(reader.uint64());
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
        message.commentList = [];
        if (object.commentList !== undefined && object.commentList !== null) {
            for (const e of object.commentList) {
                message.commentList.push(Comment.fromJSON(e));
            }
        }
        if (object.commentCount !== undefined && object.commentCount !== null) {
            message.commentCount = Number(object.commentCount);
        }
        else {
            message.commentCount = 0;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        if (message.commentList) {
            obj.commentList = message.commentList.map((e) => (e ? Comment.toJSON(e) : undefined));
        }
        else {
            obj.commentList = [];
        }
        message.commentCount !== undefined && (obj.commentCount = message.commentCount);
        return obj;
    },
    fromPartial(object) {
        const message = { ...baseGenesisState };
        message.commentList = [];
        if (object.commentList !== undefined && object.commentList !== null) {
            for (const e of object.commentList) {
                message.commentList.push(Comment.fromPartial(e));
            }
        }
        if (object.commentCount !== undefined && object.commentCount !== null) {
            message.commentCount = object.commentCount;
        }
        else {
            message.commentCount = 0;
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
