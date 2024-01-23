package mempool

import (
	"context"
	"fmt"

	"cosmossdk.io/log"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/mempool"
	"github.com/cosmos/cosmos-sdk/x/auth/signing"
)

var _ mempool.Mempool = (*ThresholdMempool)(nil)

type ThresholdMempool struct {
	logger      log.Logger
	pendingPool thTxs
	pool        thTxs
}

func NewThresholdMempool(logger log.Logger) *ThresholdMempool {
	return &ThresholdMempool{
		logger: logger.With("module", "threshold-mempool"),
	}
}

func (t *ThresholdMempool) Insert(ctx context.Context, tx sdk.Tx) error {
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		t.logger.Error("Error unable to retrieve tx signatures")
		return err
	}
	// Guarantee there is at least 1 signer
	if len(sigs) == 0 {
		t.logger.Error("Error missing tx signatures")
		return fmt.Errorf("transaction must be signed")
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()
	t.logger.Info(fmt.Sprintf("This is the sender account address :: %v", sender))

	// Set default 0 priority
	priority := int64(0)
	appTx := thTx{
		sender,
		priority,
		tx,
	}

	t.logger.Info(fmt.Sprintf("Inserting transaction from %v with priority %v", sender, priority))

	t.pendingPool.txs = append(t.pendingPool.txs, appTx)
	leng := len(t.pendingPool.txs)
	t.logger.Info(fmt.Sprintf("Transactions length %v", leng))

	return nil
}

func (t *ThresholdMempool) Select(ctx context.Context, i [][]byte) mempool.Iterator {
	if len(t.pool.txs) == 0 {
		return nil
	}

	return &t.pool
}

func (t *ThresholdMempool) SelectPending(ctx context.Context, i [][]byte) mempool.Iterator {
	if len(t.pendingPool.txs) == 0 {
		return nil
	}

	return &t.pendingPool
}

func (t *ThresholdMempool) Update(ctx context.Context, tx sdk.Tx) error {
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		return err
	}
	if len(sigs) == 0 {
		return fmt.Errorf("tx must have at least one signer")
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()

	txToUpdate := thTx{
		sender,
		1,
		tx,
	}

	for idx, ttx := range t.pendingPool.txs {
		if ttx.Equal(txToUpdate) {
			t.pendingPool.txs = removeAtIndex(t.pendingPool.txs, idx)
			t.pool.txs = append(t.pool.txs, txToUpdate)
			return nil
		}
	}
	// remove from pendingPool, add to

	return mempool.ErrTxNotFound
}

func (t *ThresholdMempool) CountTx() int {
	return len(t.pendingPool.txs)
}

func (t *ThresholdMempool) Remove(tx sdk.Tx) error {
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		return err
	}
	if len(sigs) == 0 {
		return fmt.Errorf("tx must have at least one signer")
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()

	txToRemove := thTx{
		sender,
		1,
		tx,
	}

	for idx, ttx := range t.pool.txs {
		if ttx.Equal(txToRemove) {
			t.pool.txs = removeAtIndex(t.pool.txs, idx)
			return nil
		}
	}

	return mempool.ErrTxNotFound
}

var _ mempool.Iterator = &thTxs{}

type thTxs struct {
	idx int
	txs []thTx
}

func (t *thTxs) Next() mempool.Iterator {
	if len(t.txs) == 0 {
		return nil
	}

	if len(t.txs) == t.idx+1 {
		return nil
	}

	t.idx++
	return t
}

func (t *thTxs) Tx() sdk.Tx {
	if t.idx >= len(t.txs) {
		panic(fmt.Sprintf("index out of bound: %d, Txs: %v", t.idx, t))
	}

	return t.txs[t.idx].tx
}

type thTx struct {
	address  string
	priority int64
	tx       sdk.Tx
}

func (tx thTx) Equal(other thTx) bool {
	if tx.address != other.address {
		return false
	}

	if len(tx.tx.GetMsgs()) != len(other.tx.GetMsgs()) {
		return false
	}

	for i, msg := range tx.tx.GetMsgs() {
		if msg.String() != other.tx.GetMsgs()[i].String() {
			return false
		}
	}

	return true
}

func removeAtIndex[T any](slice []T, index int) []T {
	return append(slice[:index], slice[index+1:]...)
}
