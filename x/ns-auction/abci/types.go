package abci

import (
	"cosmossdk.io/log"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/x/ns-auction/mempool"
	"github.com/cosmos/sdk-tutorials/x/ns-auction/provider"
)

type PrepareProposalHandler struct {
	logger      log.Logger
	txConfig    client.TxConfig
	codec       codec.Codec
	mempool     *mempool.ThresholdMempool
	txProvider  provider.TxProvider
	keyname     string
	runProvider bool
}

type ProcessProposalHandler struct {
	TxConfig client.TxConfig
	Codec    codec.Codec
	Logger   log.Logger
}

type VoteExtHandler struct {
	logger       log.Logger
	currentBlock int64
	mempool      *mempool.ThresholdMempool
	cdc          codec.Codec
}

type InjectedVoteExt struct {
	VoteExtSigner []byte
	Bids          [][]byte
}

type AppVoteExtension struct {
	Height int64
	Bids   [][]byte
}

type SpecialTransaction struct {
	Height int
	Bids   [][]byte
}
