package rest

import (
	"net/http"
	"strconv"

	"github.com/cosmos/cosmos-sdk/client/context"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/github-username/scavenge/x/scavenge/types"
)

// Used to not have an error if strconv is unused
var _ = strconv.Itoa(42)

type createCommitRequest struct {
	BaseReq               rest.BaseReq `json:"base_req"`
	Scavenger             string       `json:"scavenger"`
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
		scavenger, err := sdk.AccAddressFromBech32(req.Scavenger)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		parsedSolutionHash := req.SolutionHash

		parsedSolutionScavengerHash := req.SolutionScavengerHash

		msg := types.NewMsgCommitSolution(
			scavenger,
			parsedSolutionHash,
			parsedSolutionScavengerHash,
		)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

type setCommitRequest struct {
	BaseReq               rest.BaseReq `json:"base_req"`
	Scavenger             string       `json:"scavenger"`
	SolutionHash          string       `json:"solutionHash"`
	SolutionScavengerHash string       `json:"solutionScavengerHash"`
}

func setCommitHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req setCommitRequest
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}
		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}
		scavenger, err := sdk.AccAddressFromBech32(req.Scavenger)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		parsedSolutionHash := req.SolutionHash

		parsedSolutionScavengerHash := req.SolutionScavengerHash

		msg := types.NewMsgSetCommit(
			scavenger,
			req.SolutionHash,
			parsedSolutionHash,
			parsedSolutionScavengerHash,
		)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

type deleteCommitRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string       `json:"creator"`
	ID      string       `json:"id"`
}

func deleteCommitHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req deleteCommitRequest
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}
		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}
		creator, err := sdk.AccAddressFromBech32(req.Creator)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		msg := types.NewMsgDeleteCommit(req.ID, creator)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
