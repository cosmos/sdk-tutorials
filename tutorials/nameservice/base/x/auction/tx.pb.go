// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: cosmos/auction/v1/tx.proto

package auction

import (
	context "context"
	fmt "fmt"
	_ "github.com/cosmos/cosmos-proto"
	github_com_cosmos_cosmos_sdk_types "github.com/cosmos/cosmos-sdk/types"
	types "github.com/cosmos/cosmos-sdk/types"
	_ "github.com/cosmos/cosmos-sdk/types/msgservice"
	_ "github.com/cosmos/cosmos-sdk/types/tx/amino"
	_ "github.com/cosmos/gogoproto/gogoproto"
	grpc1 "github.com/cosmos/gogoproto/grpc"
	proto "github.com/cosmos/gogoproto/proto"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	io "io"
	math "math"
	math_bits "math/bits"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion3 // please upgrade the proto package

// MsgReserve represents a message to purchase a nameservice.
type MsgBid struct {
	// name defines the human readable address
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	// resolveAddress defines the bech32 address to resolve to
	ResolveAddress string `protobuf:"bytes,2,opt,name=resolve_address,json=resolveAddress,proto3" json:"resolve_address,omitempty"`
	// owner is the address of the owner of listing
	Owner string `protobuf:"bytes,3,opt,name=owner,proto3" json:"owner,omitempty"`
	//   price is the last price paid for listing
	Amount github_com_cosmos_cosmos_sdk_types.Coins `protobuf:"bytes,4,rep,name=amount,proto3,castrepeated=github.com/cosmos/cosmos-sdk/types.Coins" json:"amount"`
}

func (m *MsgBid) Reset()         { *m = MsgBid{} }
func (m *MsgBid) String() string { return proto.CompactTextString(m) }
func (*MsgBid) ProtoMessage()    {}
func (*MsgBid) Descriptor() ([]byte, []int) {
	return fileDescriptor_2f06a4e4968adb4f, []int{0}
}
func (m *MsgBid) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *MsgBid) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_MsgBid.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *MsgBid) XXX_Merge(src proto.Message) {
	xxx_messageInfo_MsgBid.Merge(m, src)
}
func (m *MsgBid) XXX_Size() int {
	return m.Size()
}
func (m *MsgBid) XXX_DiscardUnknown() {
	xxx_messageInfo_MsgBid.DiscardUnknown(m)
}

var xxx_messageInfo_MsgBid proto.InternalMessageInfo

func (m *MsgBid) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *MsgBid) GetResolveAddress() string {
	if m != nil {
		return m.ResolveAddress
	}
	return ""
}

func (m *MsgBid) GetOwner() string {
	if m != nil {
		return m.Owner
	}
	return ""
}

func (m *MsgBid) GetAmount() github_com_cosmos_cosmos_sdk_types.Coins {
	if m != nil {
		return m.Amount
	}
	return nil
}

// MsgSendResponse defines the Msg/Reserve response type.
type MsgBidResponse struct {
}

func (m *MsgBidResponse) Reset()         { *m = MsgBidResponse{} }
func (m *MsgBidResponse) String() string { return proto.CompactTextString(m) }
func (*MsgBidResponse) ProtoMessage()    {}
func (*MsgBidResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_2f06a4e4968adb4f, []int{1}
}
func (m *MsgBidResponse) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *MsgBidResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_MsgBidResponse.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *MsgBidResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_MsgBidResponse.Merge(m, src)
}
func (m *MsgBidResponse) XXX_Size() int {
	return m.Size()
}
func (m *MsgBidResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_MsgBidResponse.DiscardUnknown(m)
}

var xxx_messageInfo_MsgBidResponse proto.InternalMessageInfo

func init() {
	proto.RegisterType((*MsgBid)(nil), "cosmos.auction.v1.MsgBid")
	proto.RegisterType((*MsgBidResponse)(nil), "cosmos.auction.v1.MsgBidResponse")
}

func init() { proto.RegisterFile("cosmos/auction/v1/tx.proto", fileDescriptor_2f06a4e4968adb4f) }

var fileDescriptor_2f06a4e4968adb4f = []byte{
	// 416 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x84, 0x52, 0x3d, 0x6f, 0xd4, 0x40,
	0x10, 0x3d, 0xe7, 0x92, 0x93, 0x58, 0xa4, 0x40, 0xac, 0x48, 0x38, 0x96, 0x70, 0x42, 0xaa, 0x53,
	0xa4, 0xdb, 0xd5, 0x05, 0xd1, 0xd0, 0xe5, 0x42, 0x9b, 0x02, 0xd3, 0x51, 0x10, 0xad, 0xed, 0xd5,
	0x66, 0x95, 0x78, 0xe7, 0xe4, 0x59, 0x9b, 0xd0, 0x21, 0x24, 0x7a, 0x7e, 0x06, 0xa2, 0x4a, 0xc1,
	0x8f, 0x48, 0x19, 0x51, 0x51, 0x01, 0xba, 0x2b, 0xf2, 0x37, 0xd0, 0x7a, 0x27, 0xa4, 0x00, 0x94,
	0xc6, 0x1e, 0xcf, 0x7b, 0xf3, 0xf5, 0x9e, 0x59, 0x5a, 0x02, 0xd6, 0x80, 0x42, 0xb6, 0xa5, 0x33,
	0x60, 0x45, 0x37, 0x15, 0xee, 0x9c, 0xcf, 0x1b, 0x70, 0x10, 0x6f, 0x04, 0x8c, 0x13, 0xc6, 0xbb,
	0x69, 0xfa, 0x88, 0xe8, 0x35, 0x6a, 0x4f, 0xad, 0x51, 0x07, 0x6e, 0xba, 0xa9, 0x41, 0x43, 0x1f,
	0x0a, 0x1f, 0x51, 0x36, 0x23, 0x7a, 0x21, 0x51, 0x89, 0x6e, 0x5a, 0x28, 0x27, 0xa7, 0xa2, 0x04,
	0x63, 0x09, 0xdf, 0x90, 0xb5, 0xb1, 0x20, 0xfa, 0x27, 0xa5, 0x1e, 0xff, 0x63, 0xa1, 0x77, 0x73,
	0x85, 0x04, 0x6f, 0x05, 0xf8, 0x38, 0x8c, 0xa2, 0x05, 0xfb, 0x8f, 0xdd, 0x8f, 0x2b, 0x6c, 0x74,
	0x84, 0x7a, 0x66, 0xaa, 0x38, 0x66, 0xab, 0x56, 0xd6, 0x2a, 0x89, 0x76, 0xa2, 0xf1, 0xbd, 0xbc,
	0x8f, 0xe3, 0x03, 0xf6, 0xa0, 0x51, 0x08, 0x67, 0x9d, 0x3a, 0x96, 0x55, 0xd5, 0x28, 0xc4, 0x64,
	0xc5, 0xc3, 0xb3, 0xe4, 0xdb, 0xd7, 0xc9, 0x26, 0x75, 0x3a, 0x08, 0xc8, 0x2b, 0xd7, 0x18, 0xab,
	0xf3, 0x75, 0x2a, 0xa0, 0x6c, 0xcc, 0xd9, 0x1a, 0xbc, 0xb5, 0xaa, 0x49, 0x86, 0x77, 0x14, 0x06,
	0x5a, 0x7c, 0xc2, 0x46, 0xb2, 0x86, 0xd6, 0xba, 0x64, 0x75, 0x67, 0x38, 0xbe, 0xbf, 0xbf, 0xc5,
	0x89, 0xed, 0xf5, 0xe0, 0xa4, 0x07, 0x3f, 0x04, 0x63, 0x67, 0xcf, 0x2e, 0x7f, 0x6c, 0x0f, 0xbe,
	0xfc, 0xdc, 0x1e, 0x6b, 0xe3, 0x4e, 0xda, 0x82, 0x97, 0x50, 0xd3, 0x75, 0xf4, 0x9a, 0x60, 0x75,
	0x4a, 0x4a, 0xf8, 0x02, 0xfc, 0x7c, 0x7d, 0xb1, 0x17, 0xe5, 0xd4, 0xff, 0x39, 0xfb, 0x70, 0x7d,
	0xb1, 0x17, 0xa6, 0xee, 0x3e, 0x64, 0xeb, 0x41, 0x86, 0x5c, 0xe1, 0x1c, 0x2c, 0xaa, 0xfd, 0x97,
	0x6c, 0x78, 0x84, 0x3a, 0x3e, 0x64, 0x43, 0x2f, 0xce, 0x9f, 0x2d, 0x6e, 0x7d, 0xe5, 0xa1, 0x20,
	0x7d, 0xf2, 0x5f, 0xe8, 0xa6, 0x57, 0xba, 0xf6, 0xde, 0x0f, 0x9e, 0xbd, 0xb9, 0x5c, 0x64, 0xd1,
	0xd5, 0x22, 0x8b, 0x7e, 0x2d, 0xb2, 0xe8, 0xd3, 0x32, 0x1b, 0x5c, 0x2d, 0xb3, 0xc1, 0xf7, 0x65,
	0x36, 0x78, 0xfd, 0xe2, 0xef, 0x0b, 0xb0, 0x3a, 0x9d, 0xb8, 0xd6, 0x41, 0x63, 0xe4, 0x19, 0x8a,
	0xdb, 0xc8, 0xfb, 0x82, 0xaa, 0xe9, 0x4c, 0xa9, 0xc2, 0x2f, 0x72, 0x7e, 0x63, 0x7b, 0x31, 0xea,
	0x3d, 0x7d, 0xfa, 0x3b, 0x00, 0x00, 0xff, 0xff, 0xf3, 0x13, 0xce, 0xe8, 0xa0, 0x02, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// MsgClient is the client API for Msg service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type MsgClient interface {
	// Reserve defines a method to buy a nameservice with an associated bech32
	// address to resolve to.
	Bid(ctx context.Context, in *MsgBid, opts ...grpc.CallOption) (*MsgBidResponse, error)
}

type msgClient struct {
	cc grpc1.ClientConn
}

func NewMsgClient(cc grpc1.ClientConn) MsgClient {
	return &msgClient{cc}
}

func (c *msgClient) Bid(ctx context.Context, in *MsgBid, opts ...grpc.CallOption) (*MsgBidResponse, error) {
	out := new(MsgBidResponse)
	err := c.cc.Invoke(ctx, "/cosmos.auction.v1.Msg/Bid", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// MsgServer is the server API for Msg service.
type MsgServer interface {
	// Reserve defines a method to buy a nameservice with an associated bech32
	// address to resolve to.
	Bid(context.Context, *MsgBid) (*MsgBidResponse, error)
}

// UnimplementedMsgServer can be embedded to have forward compatible implementations.
type UnimplementedMsgServer struct {
}

func (*UnimplementedMsgServer) Bid(ctx context.Context, req *MsgBid) (*MsgBidResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Bid not implemented")
}

func RegisterMsgServer(s grpc1.Server, srv MsgServer) {
	s.RegisterService(&_Msg_serviceDesc, srv)
}

func _Msg_Bid_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(MsgBid)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(MsgServer).Bid(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/cosmos.auction.v1.Msg/Bid",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(MsgServer).Bid(ctx, req.(*MsgBid))
	}
	return interceptor(ctx, in, info, handler)
}

var _Msg_serviceDesc = grpc.ServiceDesc{
	ServiceName: "cosmos.auction.v1.Msg",
	HandlerType: (*MsgServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Bid",
			Handler:    _Msg_Bid_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "cosmos/auction/v1/tx.proto",
}

func (m *MsgBid) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *MsgBid) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *MsgBid) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if len(m.Amount) > 0 {
		for iNdEx := len(m.Amount) - 1; iNdEx >= 0; iNdEx-- {
			{
				size, err := m.Amount[iNdEx].MarshalToSizedBuffer(dAtA[:i])
				if err != nil {
					return 0, err
				}
				i -= size
				i = encodeVarintTx(dAtA, i, uint64(size))
			}
			i--
			dAtA[i] = 0x22
		}
	}
	if len(m.Owner) > 0 {
		i -= len(m.Owner)
		copy(dAtA[i:], m.Owner)
		i = encodeVarintTx(dAtA, i, uint64(len(m.Owner)))
		i--
		dAtA[i] = 0x1a
	}
	if len(m.ResolveAddress) > 0 {
		i -= len(m.ResolveAddress)
		copy(dAtA[i:], m.ResolveAddress)
		i = encodeVarintTx(dAtA, i, uint64(len(m.ResolveAddress)))
		i--
		dAtA[i] = 0x12
	}
	if len(m.Name) > 0 {
		i -= len(m.Name)
		copy(dAtA[i:], m.Name)
		i = encodeVarintTx(dAtA, i, uint64(len(m.Name)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *MsgBidResponse) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *MsgBidResponse) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *MsgBidResponse) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	return len(dAtA) - i, nil
}

func encodeVarintTx(dAtA []byte, offset int, v uint64) int {
	offset -= sovTx(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *MsgBid) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Name)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	l = len(m.ResolveAddress)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	l = len(m.Owner)
	if l > 0 {
		n += 1 + l + sovTx(uint64(l))
	}
	if len(m.Amount) > 0 {
		for _, e := range m.Amount {
			l = e.Size()
			n += 1 + l + sovTx(uint64(l))
		}
	}
	return n
}

func (m *MsgBidResponse) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	return n
}

func sovTx(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozTx(x uint64) (n int) {
	return sovTx(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *MsgBid) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowTx
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: MsgBid: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: MsgBid: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Name", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Name = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ResolveAddress", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ResolveAddress = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Owner", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= uint64(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Owner = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Amount", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowTx
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= int(b&0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthTx
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthTx
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Amount = append(m.Amount, types.Coin{})
			if err := m.Amount[len(m.Amount)-1].Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipTx(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthTx
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func (m *MsgBidResponse) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowTx
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= uint64(b&0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: MsgBidResponse: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: MsgBidResponse: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		default:
			iNdEx = preIndex
			skippy, err := skipTx(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthTx
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipTx(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowTx
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowTx
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
		case 1:
			iNdEx += 8
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowTx
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if length < 0 {
				return 0, ErrInvalidLengthTx
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupTx
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthTx
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthTx        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowTx          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupTx = fmt.Errorf("proto: unexpected end of group")
)
