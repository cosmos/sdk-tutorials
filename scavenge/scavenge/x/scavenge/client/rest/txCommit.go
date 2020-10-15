package rest

import (
	"net/http"

	"github.com/cosmos/cosmos-sdk/client/context"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/cosmos/sdk-tutorials/scavenge/scavenge/x/scavenge/types"
)

type createCommitRequest struct {
	BaseReq               rest.BaseReq `json:"base_req"`
	Creator               string       `json:"creator"`
	SolutionHash          string       `json:"solutionHash"`
	SolutionScavengerHash string       `json:"solutionScavengerHash"`
}

func createCommitHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createCommitRequest
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}
		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}
		scavenger, err := sdk.AccAddressFromBech32(req.Creator)

		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		msg := types.NewMsgCommitSolution(scavenger, req.SolutionHash, req.SolutionScavengerHash)
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
