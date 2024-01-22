package mempool

import (
	"fmt"
	cryptotypes "github.com/cosmos/cosmos-sdk/crypto/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	txsigning "github.com/cosmos/cosmos-sdk/types/tx/signing"
	"github.com/cosmos/cosmos-sdk/x/auth/signing"
	"google.golang.org/protobuf/proto"
)

// testPubKey is a dummy implementation of PubKey used for testing.
type testPubKey struct {
	address sdk.AccAddress
}

func (t testPubKey) Reset() { panic("not implemented") }

func (t testPubKey) String() string { panic("not implemented") }

func (t testPubKey) ProtoMessage() { panic("not implemented") }

func (t testPubKey) Address() cryptotypes.Address { return t.address.Bytes() }

func (t testPubKey) Bytes() []byte { panic("not implemented") }

func (t testPubKey) VerifySignature(msg []byte, sig []byte) bool { panic("not implemented") }

func (t testPubKey) Equals(key cryptotypes.PubKey) bool { panic("not implemented") }

func (t testPubKey) Type() string { panic("not implemented") }

// testTx is a dummy implementation of Tx used for testing.
type testTx struct {
	id      int
	address sdk.AccAddress
	nonce   uint64
}

func (tx testTx) GetMsgsV2() ([]proto.Message, error) {
	//TODO implement me
	panic("implement me")
}

func (tx testTx) GetSigners() ([][]byte, error) { panic("not implemented") }

func (tx testTx) GetPubKeys() ([]cryptotypes.PubKey, error) { panic("not implemented") }

func (tx testTx) GetSignaturesV2() ([]txsigning.SignatureV2, error) {
	return []txsigning.SignatureV2{{
		PubKey:   testPubKey{address: tx.address},
		Data:     nil,
		Sequence: tx.nonce,
	}}, nil
}

func (tx testTx) GetGas() uint64 {
	return 10
}

func (tx testTx) GetFee() sdk.Coins {
	return sdk.NewCoins(sdk.NewInt64Coin("stake", int64(5)))
}

func (tx testTx) FeePayer() sdk.AccAddress {
	return tx.address
}

func (tx testTx) FeeGranter() sdk.AccAddress {
	return tx.address
}

var (
	_ sdk.Tx                  = (*testTx)(nil)
	_ signing.SigVerifiableTx = (*testTx)(nil)
	_ cryptotypes.PubKey      = (*testPubKey)(nil)
)

func (tx testTx) GetMsgs() []sdk.Msg { return nil }

func (tx testTx) ValidateBasic() error { return nil }

func (tx testTx) String() string {
	return fmt.Sprintf("tx a: %s, n: %d", tx.address, tx.nonce)
}
