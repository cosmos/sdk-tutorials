package mempool

import (
	"context"
	"fmt"

	"cosmossdk.io/log"

	sdk "github.com/cosmos/cosmos-sdk/types"
	mempool "github.com/cosmos/cosmos-sdk/types/mempool"
	"github.com/cosmos/cosmos-sdk/x/auth/signing"
)

var _ mempool.Mempool = (*ThresholdMempool)(nil)
var _ mempool.Iterator = &thresholdTxs{}

type ThresholdMempool struct {
	logger log.Logger
	// Where new transactions are initially added when they are received. These transactions are waiting to be processed.
	pendingPool thresholdTxs
	// Where txs are moved once they have been processed and are ready to be included in the next block.
	pool thresholdTxs
}

type thresholdTxs struct {
	idx int
	txs []thresholdTx
}

type thresholdTx struct {
	address  string
	priority int64
	tx       sdk.Tx
}

func NewThresholdMempool(logger log.Logger) *ThresholdMempool {
	return &ThresholdMempool{
		logger: logger.With("module", "threshold-mempool"),
	}
}

func (tm *ThresholdMempool) Insert(ctx context.Context, tx sdk.Tx) error {
	//we are verifying that the tx is valid by it being signed
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		tm.logger.Error("Error unable to retrieve tx signatures")
		return err
	}

	if len(sigs) == 0 {
		tm.logger.Error("Error missing tx signatures")
		return fmt.Errorf("Transaction must be signed")
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()
	tm.logger.Info(fmt.Sprintf("This is the sender account address :: %v", sender))

	priority := int64(0)
	appTx := thresholdTx{
		tx:       tx,
		address:  sender,
		priority: priority,
	}

	tm.logger.Info(fmt.Sprintf("Inserting transaction from %v with priority %v", sender, priority))

	tm.pendingPool.txs = append(tm.pendingPool.txs, appTx)
	leng := len(tm.pendingPool.txs)
	tm.logger.Info(fmt.Sprintf("Transactions length %v", leng))
	return nil
}

func (tm *ThresholdMempool) Select(ctx context.Context, i [][]byte) mempool.Iterator {
	if len(tm.pool.txs) == 0 {
		return nil
	}
	return &tm.pool
}

func (tm *ThresholdMempool) SelectPending(ctx context.Context, i [][]byte) mempool.Iterator {
	if len(tm.pendingPool.txs) == 0 {
		return nil
	}

	return &tm.pendingPool
}

func (tm *ThresholdMempool) Update(ctx context.Context, tx sdk.Tx) error {
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		tm.logger.Error("Error unable to retrieve tx signatures")
		return err
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()
	tm.logger.Info(fmt.Sprintf("This is the sender account address :: %v", sender))

	txToUpdate := thresholdTx{
		sender,
		1,
		tx,
	}

	for idx, tmtx := range tm.pendingPool.txs {
		if tmtx.Equal(txToUpdate) {
			tm.pendingPool.txs = append(tm.pendingPool.txs[:idx], tm.pendingPool.txs[idx+1:]...)
			tm.pool.txs = append(tm.pool.txs, txToUpdate)
		}
	}

	return mempool.ErrTxNotFound
}

func (tm *ThresholdMempool) CountTx() int {
	return len(tm.pendingPool.txs)
}

func (tm *ThresholdMempool) Remove(tx sdk.Tx) error {
	sigs, err := tx.(signing.SigVerifiableTx).GetSignaturesV2()
	if err != nil {
		return err
	}
	if len(sigs) == 0 {
		return fmt.Errorf("tx must have at least one signer")
	}

	sig := sigs[0]
	sender := sdk.AccAddress(sig.PubKey.Address()).String()

	txToRemove := thresholdTx{
		sender,
		1,
		tx,
	}

	for idx, ttx := range tm.pool.txs {
		if ttx.Equal(txToRemove) {
			tm.pendingPool.txs = append(tm.pendingPool.txs[:idx], tm.pendingPool.txs[idx+1:]...)
			return nil
		}
	}

	return mempool.ErrTxNotFound
}

func (ttxs *thresholdTxs) Next() mempool.Iterator {
	if len(ttxs.txs) == 0 {
		return nil
	}

	if len(ttxs.txs) == ttxs.idx+1 {
		return nil
	}

	ttxs.idx++
	return ttxs
}

func (ttxs *thresholdTxs) Tx() sdk.Tx {
	if ttxs.idx >= len(ttxs.txs) {
		panic(fmt.Sprintf("index out of bound: %d, Txs: %v", ttxs.idx, ttxs))
	}

	return ttxs.txs[ttxs.idx].tx
}

func (tx thresholdTx) Equal(other thresholdTx) bool {
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
