package abci

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"

	"cosmossdk.io/log"
	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	auctiontypes "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
	"github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/mempool"
	"github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/provider"
)

func NewPrepareProposalHandler(
	lg log.Logger,
	txCg client.TxConfig,
	cdc codec.Codec,
	mp *mempool.ThresholdMempool,
	pv provider.TxProvider,
	runProv bool,
) *PrepareProposalHandler {
	return &PrepareProposalHandler{
		logger:      lg,
		txConfig:    txCg,
		cdc:         cdc,
		mempool:     mp,
		txProvider:  pv,
		runProvider: runProv,
	}
}

func (h *PrepareProposalHandler) PrepareProposalHandler() sdk.PrepareProposalHandler {
	return func(ctx sdk.Context, req *abci.RequestPrepareProposal) (*abci.ResponsePrepareProposal, error) {
		h.logger.Info("🛠️ :: Prepare Proposal")
		var proposalTxs [][]byte

		// Get Vote Extensions
		if req.Height > 2 {

			// Get Special Transaction
			ve, err := processVoteExtensions(req, h.logger)
			if err != nil {
				h.logger.Error(fmt.Sprintf("❌️ :: Unable to process Vote Extensions: %v", err))
			}

			// Marshal Special Transaction
			bz, err := json.Marshal(ve)
			if err != nil {
				h.logger.Error(fmt.Sprintf("❌️ :: Unable to marshal Vote Extensions: %v", err))
			}

			// Append Special Transaction to proposal
			proposalTxs = append(proposalTxs, bz)
		}

		var txs []sdk.Tx
		itr := h.mempool.Select(context.Background(), nil)
		for itr != nil {
			tmptx := itr.Tx()

			txs = append(txs, tmptx)
			itr = itr.Next()
		}
		h.logger.Info(fmt.Sprintf("🛠️ :: Number of Transactions available from mempool: %v", len(txs)))

		if h.runProvider {
			tmpMsgs, err := h.txProvider.BuildProposal(ctx, txs)
			if err != nil {
				h.logger.Error(fmt.Sprintf("❌️ :: Error Building Custom Proposal: %v", err))
			}
			txs = tmpMsgs
		}

		for _, sdkTxs := range txs {
			txBytes, err := h.txConfig.TxEncoder()(sdkTxs)
			if err != nil {
				h.logger.Info(fmt.Sprintf("❌~Error encoding transaction: %v", err.Error()))
			}
			proposalTxs = append(proposalTxs, txBytes)
		}

		h.logger.Info(fmt.Sprintf("🛠️ :: Number of Transactions in proposal: %v", len(proposalTxs)))

		return &abci.ResponsePrepareProposal{Txs: proposalTxs}, nil
	}
}

func (h *ProcessProposalHandler) ProcessProposalHandler() sdk.ProcessProposalHandler {
	return func(ctx sdk.Context, req *abci.RequestProcessProposal) (resp *abci.ResponseProcessProposal, err error) {
		h.Logger.Info("⚙️ :: Process Proposal")

		// The first transaction will always be the Special Transaction
		numTxs := len(req.Txs)
		if numTxs == 1 {
			h.Logger.Info(fmt.Sprintf("⚙️:: Number of transactions :: %v", numTxs))
		}

		if numTxs >= 1 {
			h.Logger.Info(fmt.Sprintf("⚙️:: Number of transactions :: %v", numTxs))
			var st SpecialTransaction
			err = json.Unmarshal(req.Txs[0], &st)
			if err != nil {
				h.Logger.Error(fmt.Sprintf("❌️:: Error unmarshalling special Tx in Process Proposal :: %v", err))
			}
			if len(st.Bids) > 0 {
				h.Logger.Info("⚙️:: There are bids in the Special Transaction")
				var bids []auctiontypes.MsgBid
				for i, b := range st.Bids {
					var bid auctiontypes.MsgBid
					err := h.Codec.Unmarshal(b, &bid)
					if err != nil {
						return nil, err
					}
					h.Logger.Info(fmt.Sprintf("⚙️:: Special Transaction Bid No %v :: %v", i, bid))
					bids = append(bids, bid)
				}
				// Validate Bids in Tx
				txs := req.Txs[1:]
				ok, err := ValidateBids(h.TxConfig, bids, txs, h.Logger)
				if err != nil {
					h.Logger.Error(fmt.Sprintf("❌️:: Error validating bids in Process Proposal :: %v", err))
					return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_REJECT}, nil
				}
				if !ok {
					h.Logger.Error(fmt.Sprintf("❌️:: Unable to validate bids in Process Proposal :: %v", err))
					return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_REJECT}, nil
				}
				h.Logger.Info("⚙️:: Successfully validated bids in Process Proposal")
			}
		}

		return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_ACCEPT}, nil
	}
}

func processVoteExtensions(req *abci.RequestPrepareProposal, log log.Logger) (SpecialTransaction, error) {
	log.Info("🛠️ :: Process Vote Extensions")

	// Create empty response
	st := SpecialTransaction{
		0,
		[][]byte{},
	}

	// Get Vote Ext for H-1 from Req
	voteExt := req.GetLocalLastCommit()
	votes := voteExt.Votes

	// Iterate through votes
	var ve AppVoteExtension
	for _, vote := range votes {
		// Unmarshal to AppExt
		err := json.Unmarshal(vote.VoteExtension, &ve)
		if err != nil {
			log.Error("❌ :: Error unmarshalling Vote Extension")
		}

		st.Height = int(ve.Height)

		// If Bids in VE, append to Special Transaction
		if len(ve.Bids) > 0 {
			log.Info("🛠️ :: Bids in VE")
			st.Bids = append(st.Bids, ve.Bids...)
		}
	}

	return st, nil
}

func ValidateBids(txConfig client.TxConfig, veBids []auctiontypes.MsgBid, proposalTxs [][]byte, logger log.Logger) (bool, error) {
	var proposalBids []*auctiontypes.MsgBid
	for _, txBytes := range proposalTxs {
		txDecoder := txConfig.TxDecoder()
		messages, err := txDecoder(txBytes)
		if err != nil {
			logger.Error(fmt.Sprintf("❌️:: Unable to decode proposal transactions :: %v", err))

			return false, err
		}
		sdkMsgs := messages.GetMsgs()
		for _, m := range sdkMsgs {
			if m, ok := m.(*auctiontypes.MsgBid); ok {
				proposalBids = append(proposalBids, m)
			}
		}
	}

	bidFreq := make(map[string]int)
	totalVotes := len(veBids)
	for _, b := range veBids {
		h, err := Hash(b)
		if err != nil {
			logger.Error(fmt.Sprintf("❌️:: Unable to produce bid frequency map :: %v", err))

			return false, err
		}
		bidFreq[h]++
	}

	thresholdCount := int(float64(totalVotes) * 0.5)
	logger.Info(fmt.Sprintf("🛠️ :: VE Threshold: %v", thresholdCount))
	ok := true
	logger.Info(fmt.Sprintf("🛠️ :: Number of Proposal Bids: %v", len(proposalBids)))

	for _, p := range proposalBids {

		key, err := Hash(*p)
		if err != nil {
			logger.Error(fmt.Sprintf("❌️:: Unable to hash proposal bid :: %v", err))

			return false, err
		}
		freq := bidFreq[key]
		logger.Info(fmt.Sprintf("🛠️ :: Frequency for Proposal Bid: %v", freq))
		if freq < thresholdCount {
			logger.Error(fmt.Sprintf("❌️:: Detected invalid proposal bid :: %v", p))

			ok = false
		}
	}
	return ok, nil
}

func Hash(m auctiontypes.MsgBid) (string, error) {
	b, err := json.Marshal(m)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
