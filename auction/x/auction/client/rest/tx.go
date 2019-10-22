package rest

import (
	"net/http"
	"time"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/client/utils"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
	"github.com/gorilla/mux"
)

func registerTxRoutes(cliCtx context.CLIContext, r *mux.Router) {
	r.HandleFunc(
		"/auction/create_auction/{nftID}",
		createAuctionHandler(cliCtx),
	).Methods("POST")
	r.HandleFunc(
		"/auction/bid/{nftID}",
		placeBidHandler(cliCtx),
	).Methods("POST")
}

type createAuctionReq struct {
	BaseReq  rest.BaseReq  `json:"base_req"`
	NftID    string        `json:"nft_id"`
	NftDenom string        `json:"nft_denom"`
	Owner    string        `json:"owner"`
	EndTime  time.Duration `json:"end_time"`
}

func createAuctionHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createAuctionReq

		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		addr, err := sdk.AccAddressFromBech32(req.Owner)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		msg := types.NewMsgCreateAuction(req.NftID, req.NftDenom, addr, req.EndTime)
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

type bidReq struct {
	BaseReq rest.BaseReq `json:"base_req"`
	NftID   string       `json:"nft_id"`
	Bid     string       `json:"bid"`
	Bidder  string       `json:"bidder"`
}

func placeBidHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req bidReq

		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		addr, err := sdk.AccAddressFromBech32(req.Bidder)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		coins, err := sdk.ParseCoins(req.Bid)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		msg := types.NewMsgBid(addr, coins, req.NftID)
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
