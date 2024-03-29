// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: cosmos/auction/v1/query.proto

package auction

import (
	context "context"
	fmt "fmt"
	_ "github.com/cosmos/cosmos-sdk/types/query"
	grpc1 "github.com/cosmos/gogoproto/grpc"
	proto "github.com/cosmos/gogoproto/proto"
	_ "google.golang.org/genproto/googleapis/api/annotations"
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

// QueryNameResponse is the response type for the Query/Names RPC method
type QueryNameResponse struct {
	Name *Name `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
}

func (m *QueryNameResponse) Reset()         { *m = QueryNameResponse{} }
func (m *QueryNameResponse) String() string { return proto.CompactTextString(m) }
func (*QueryNameResponse) ProtoMessage()    {}
func (*QueryNameResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_4def34f334516604, []int{0}
}
func (m *QueryNameResponse) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *QueryNameResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_QueryNameResponse.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *QueryNameResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_QueryNameResponse.Merge(m, src)
}
func (m *QueryNameResponse) XXX_Size() int {
	return m.Size()
}
func (m *QueryNameResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_QueryNameResponse.DiscardUnknown(m)
}

var xxx_messageInfo_QueryNameResponse proto.InternalMessageInfo

func (m *QueryNameResponse) GetName() *Name {
	if m != nil {
		return m.Name
	}
	return nil
}

// QueryNameRequest is the request type for the Query/Names RPC method
type QueryNameRequest struct {
	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
}

func (m *QueryNameRequest) Reset()         { *m = QueryNameRequest{} }
func (m *QueryNameRequest) String() string { return proto.CompactTextString(m) }
func (*QueryNameRequest) ProtoMessage()    {}
func (*QueryNameRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_4def34f334516604, []int{1}
}
func (m *QueryNameRequest) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *QueryNameRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_QueryNameRequest.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalToSizedBuffer(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (m *QueryNameRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_QueryNameRequest.Merge(m, src)
}
func (m *QueryNameRequest) XXX_Size() int {
	return m.Size()
}
func (m *QueryNameRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_QueryNameRequest.DiscardUnknown(m)
}

var xxx_messageInfo_QueryNameRequest proto.InternalMessageInfo

func (m *QueryNameRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func init() {
	proto.RegisterType((*QueryNameResponse)(nil), "cosmos.auction.v1.QueryNameResponse")
	proto.RegisterType((*QueryNameRequest)(nil), "cosmos.auction.v1.QueryNameRequest")
}

func init() { proto.RegisterFile("cosmos/auction/v1/query.proto", fileDescriptor_4def34f334516604) }

var fileDescriptor_4def34f334516604 = []byte{
	// 316 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x7c, 0x91, 0xc1, 0x4a, 0xc3, 0x30,
	0x1c, 0xc6, 0x57, 0x99, 0x82, 0xf1, 0xe2, 0x72, 0xd0, 0x31, 0x35, 0xc8, 0x14, 0x11, 0xc5, 0x84,
	0xce, 0x17, 0x10, 0xf1, 0x2c, 0xe8, 0xd1, 0x83, 0x90, 0xd6, 0x3f, 0x35, 0xb8, 0x26, 0x5d, 0x93,
	0x16, 0xa7, 0x78, 0xf1, 0x09, 0x04, 0x5f, 0xca, 0xe3, 0xc0, 0x8b, 0x47, 0x69, 0x7d, 0x10, 0x49,
	0xd3, 0x62, 0xd1, 0xe1, 0xa5, 0x34, 0x7c, 0xbf, 0xef, 0xfb, 0x7f, 0xf9, 0x07, 0x6d, 0x85, 0x4a,
	0xc7, 0x4a, 0x33, 0x9e, 0x85, 0x46, 0x28, 0xc9, 0x72, 0x9f, 0x4d, 0x32, 0x48, 0xa7, 0x34, 0x49,
	0x95, 0x51, 0xb8, 0xe7, 0x64, 0x5a, 0xcb, 0x34, 0xf7, 0x07, 0x73, 0x1c, 0x66, 0x9a, 0x80, 0x76,
	0x8e, 0xc1, 0x66, 0xa4, 0x54, 0x34, 0x06, 0xc6, 0x13, 0xc1, 0xb8, 0x94, 0xca, 0x70, 0x4b, 0x35,
	0xea, 0x41, 0x6d, 0x0e, 0xb8, 0x06, 0x37, 0x88, 0xe5, 0x7e, 0x00, 0x86, 0xfb, 0x2c, 0xe1, 0x91,
	0x90, 0x15, 0x5c, 0xb3, 0x1b, 0x35, 0xdb, 0x60, 0xed, 0x62, 0xc3, 0x13, 0xd4, 0xbb, 0xb0, 0xc7,
	0x73, 0x1e, 0xc3, 0x25, 0xe8, 0x44, 0x49, 0x0d, 0xf8, 0x10, 0x75, 0x25, 0x8f, 0xa1, 0xef, 0x6d,
	0x7b, 0xfb, 0x2b, 0xa3, 0x75, 0xfa, 0xa7, 0x3c, 0xad, 0xf0, 0x0a, 0x1a, 0xee, 0xa1, 0xd5, 0x56,
	0xc2, 0x24, 0x03, 0x6d, 0x30, 0x6e, 0x05, 0x2c, 0x3b, 0x6e, 0xf4, 0x80, 0x16, 0x2b, 0x0e, 0x4f,
	0x50, 0xd7, 0xb2, 0x78, 0x67, 0x4e, 0xee, 0xef, 0xa4, 0xc1, 0xee, 0xff, 0x90, 0x2b, 0x3c, 0x24,
	0xcf, 0xef, 0x5f, 0xaf, 0x0b, 0x7d, 0xbc, 0xc6, 0xea, 0xbb, 0x4a, 0xcd, 0xec, 0x50, 0xf6, 0x68,
	0xbf, 0x4f, 0xa7, 0xd7, 0x6f, 0x05, 0xf1, 0x66, 0x05, 0xf1, 0x3e, 0x0b, 0xe2, 0xbd, 0x94, 0xa4,
	0x33, 0x2b, 0x49, 0xe7, 0xa3, 0x24, 0x9d, 0xab, 0xb3, 0x48, 0x98, 0xdb, 0x2c, 0xa0, 0xa1, 0x8a,
	0x1b, 0xaf, 0xbe, 0xb9, 0x3b, 0x32, 0x99, 0x51, 0xa9, 0xe0, 0x63, 0xcd, 0x7e, 0xfe, 0x6c, 0x94,
	0x86, 0x34, 0x17, 0x21, 0xb8, 0xbd, 0xdf, 0x37, 0x6f, 0x17, 0x2c, 0x55, 0xcb, 0x3c, 0xfe, 0x0e,
	0x00, 0x00, 0xff, 0xff, 0x99, 0xec, 0x5d, 0xcd, 0x06, 0x02, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// QueryClient is the client API for Query service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type QueryClient interface {
	// Name is a method that takes a QueryNameRequest and returns a QueryNameResponse.
	Name(ctx context.Context, in *QueryNameRequest, opts ...grpc.CallOption) (*QueryNameResponse, error)
}

type queryClient struct {
	cc grpc1.ClientConn
}

func NewQueryClient(cc grpc1.ClientConn) QueryClient {
	return &queryClient{cc}
}

func (c *queryClient) Name(ctx context.Context, in *QueryNameRequest, opts ...grpc.CallOption) (*QueryNameResponse, error) {
	out := new(QueryNameResponse)
	err := c.cc.Invoke(ctx, "/cosmos.auction.v1.Query/Name", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// QueryServer is the server API for Query service.
type QueryServer interface {
	// Name is a method that takes a QueryNameRequest and returns a QueryNameResponse.
	Name(context.Context, *QueryNameRequest) (*QueryNameResponse, error)
}

// UnimplementedQueryServer can be embedded to have forward compatible implementations.
type UnimplementedQueryServer struct {
}

func (*UnimplementedQueryServer) Name(ctx context.Context, req *QueryNameRequest) (*QueryNameResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Name not implemented")
}

func RegisterQueryServer(s grpc1.Server, srv QueryServer) {
	s.RegisterService(&_Query_serviceDesc, srv)
}

func _Query_Name_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(QueryNameRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(QueryServer).Name(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/cosmos.auction.v1.Query/Name",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(QueryServer).Name(ctx, req.(*QueryNameRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _Query_serviceDesc = grpc.ServiceDesc{
	ServiceName: "cosmos.auction.v1.Query",
	HandlerType: (*QueryServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Name",
			Handler:    _Query_Name_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "cosmos/auction/v1/query.proto",
}

func (m *QueryNameResponse) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *QueryNameResponse) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *QueryNameResponse) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if m.Name != nil {
		{
			size, err := m.Name.MarshalToSizedBuffer(dAtA[:i])
			if err != nil {
				return 0, err
			}
			i -= size
			i = encodeVarintQuery(dAtA, i, uint64(size))
		}
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func (m *QueryNameRequest) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalToSizedBuffer(dAtA[:size])
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *QueryNameRequest) MarshalTo(dAtA []byte) (int, error) {
	size := m.Size()
	return m.MarshalToSizedBuffer(dAtA[:size])
}

func (m *QueryNameRequest) MarshalToSizedBuffer(dAtA []byte) (int, error) {
	i := len(dAtA)
	_ = i
	var l int
	_ = l
	if len(m.Name) > 0 {
		i -= len(m.Name)
		copy(dAtA[i:], m.Name)
		i = encodeVarintQuery(dAtA, i, uint64(len(m.Name)))
		i--
		dAtA[i] = 0xa
	}
	return len(dAtA) - i, nil
}

func encodeVarintQuery(dAtA []byte, offset int, v uint64) int {
	offset -= sovQuery(v)
	base := offset
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return base
}
func (m *QueryNameResponse) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	if m.Name != nil {
		l = m.Name.Size()
		n += 1 + l + sovQuery(uint64(l))
	}
	return n
}

func (m *QueryNameRequest) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.Name)
	if l > 0 {
		n += 1 + l + sovQuery(uint64(l))
	}
	return n
}

func sovQuery(x uint64) (n int) {
	return (math_bits.Len64(x|1) + 6) / 7
}
func sozQuery(x uint64) (n int) {
	return sovQuery(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *QueryNameResponse) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowQuery
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
			return fmt.Errorf("proto: QueryNameResponse: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: QueryNameResponse: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Name", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowQuery
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
				return ErrInvalidLengthQuery
			}
			postIndex := iNdEx + msglen
			if postIndex < 0 {
				return ErrInvalidLengthQuery
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.Name == nil {
				m.Name = &Name{}
			}
			if err := m.Name.Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipQuery(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthQuery
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
func (m *QueryNameRequest) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowQuery
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
			return fmt.Errorf("proto: QueryNameRequest: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: QueryNameRequest: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Name", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowQuery
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
				return ErrInvalidLengthQuery
			}
			postIndex := iNdEx + intStringLen
			if postIndex < 0 {
				return ErrInvalidLengthQuery
			}
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.Name = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipQuery(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if (skippy < 0) || (iNdEx+skippy) < 0 {
				return ErrInvalidLengthQuery
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
func skipQuery(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	depth := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowQuery
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
					return 0, ErrIntOverflowQuery
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
					return 0, ErrIntOverflowQuery
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
				return 0, ErrInvalidLengthQuery
			}
			iNdEx += length
		case 3:
			depth++
		case 4:
			if depth == 0 {
				return 0, ErrUnexpectedEndOfGroupQuery
			}
			depth--
		case 5:
			iNdEx += 4
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
		if iNdEx < 0 {
			return 0, ErrInvalidLengthQuery
		}
		if depth == 0 {
			return iNdEx, nil
		}
	}
	return 0, io.ErrUnexpectedEOF
}

var (
	ErrInvalidLengthQuery        = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowQuery          = fmt.Errorf("proto: integer overflow")
	ErrUnexpectedEndOfGroupQuery = fmt.Errorf("proto: unexpected end of group")
)
