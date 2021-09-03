/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';
export const protobufPackage = 'user.planet.blog';
const baseBlogPacketData = {};
export const BlogPacketData = {
    encode(message, writer = Writer.create()) {
        if (message.noData !== undefined) {
            NoData.encode(message.noData, writer.uint32(10).fork()).ldelim();
        }
        if (message.ibcPostPacket !== undefined) {
            IbcPostPacketData.encode(message.ibcPostPacket, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseBlogPacketData };
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.noData = NoData.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.ibcPostPacket = IbcPostPacketData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = { ...baseBlogPacketData };
        if (object.noData !== undefined && object.noData !== null) {
            message.noData = NoData.fromJSON(object.noData);
        }
        else {
            message.noData = undefined;
        }
        if (object.ibcPostPacket !== undefined && object.ibcPostPacket !== null) {
            message.ibcPostPacket = IbcPostPacketData.fromJSON(object.ibcPostPacket);
        }
        else {
            message.ibcPostPacket = undefined;
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.noData !== undefined && (obj.noData = message.noData ? NoData.toJSON(message.noData) : undefined);
        message.ibcPostPacket !== undefined && (obj.ibcPostPacket = message.ibcPostPacket ? IbcPostPacketData.toJSON(message.ibcPostPacket) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = { ...baseBlogPacketData };
        if (object.noData !== undefined && object.noData !== null) {
            message.noData = NoData.fromPartial(object.noData);
        }
        else {
            message.noData = undefined;
        }
        if (object.ibcPostPacket !== undefined && object.ibcPostPacket !== null) {
            message.ibcPostPacket = IbcPostPacketData.fromPartial(object.ibcPostPacket);
        }
        else {
            message.ibcPostPacket = undefined;
        }
        return message;
    }
};
const baseNoData = {};
export const NoData = {
    encode(_, writer = Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseNoData };
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        const message = { ...baseNoData };
        return message;
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = { ...baseNoData };
        return message;
    }
};
const baseIbcPostPacketData = { title: '', content: '' };
export const IbcPostPacketData = {
    encode(message, writer = Writer.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.content !== '') {
            writer.uint32(18).string(message.content);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseIbcPostPacketData };
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.content = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = { ...baseIbcPostPacketData };
        if (object.title !== undefined && object.title !== null) {
            message.title = String(object.title);
        }
        else {
            message.title = '';
        }
        if (object.content !== undefined && object.content !== null) {
            message.content = String(object.content);
        }
        else {
            message.content = '';
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.content !== undefined && (obj.content = message.content);
        return obj;
    },
    fromPartial(object) {
        const message = { ...baseIbcPostPacketData };
        if (object.title !== undefined && object.title !== null) {
            message.title = object.title;
        }
        else {
            message.title = '';
        }
        if (object.content !== undefined && object.content !== null) {
            message.content = object.content;
        }
        else {
            message.content = '';
        }
        return message;
    }
};
const baseIbcPostPacketAck = { postID: '' };
export const IbcPostPacketAck = {
    encode(message, writer = Writer.create()) {
        if (message.postID !== '') {
            writer.uint32(10).string(message.postID);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof Uint8Array ? new Reader(input) : input;
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = { ...baseIbcPostPacketAck };
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.postID = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        const message = { ...baseIbcPostPacketAck };
        if (object.postID !== undefined && object.postID !== null) {
            message.postID = String(object.postID);
        }
        else {
            message.postID = '';
        }
        return message;
    },
    toJSON(message) {
        const obj = {};
        message.postID !== undefined && (obj.postID = message.postID);
        return obj;
    },
    fromPartial(object) {
        const message = { ...baseIbcPostPacketAck };
        if (object.postID !== undefined && object.postID !== null) {
            message.postID = object.postID;
        }
        else {
            message.postID = '';
        }
        return message;
    }
};
