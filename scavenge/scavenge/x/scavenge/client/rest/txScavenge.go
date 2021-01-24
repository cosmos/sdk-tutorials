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

type createScavengeRequest struct {
	BaseReq      rest.BaseReq   `json:"base_req"`
	Creator      string         `json:"creator"`
	Description  string         `json:"description"`
	SolutionHash string         `json:"solutionHash"`
	Reward       sdk.Coins      `json:"reward"`
	Scavenger    sdk.AccAddress `json:"creator"`
}

func createScavengeHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createScavengeRequest
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

		parsedDescription := req.Description

		parsedSolutionHash := req.SolutionHash

		parsedReward := req.Reward

		msg := types.NewMsgCreateScavenge(
			creator,
			parsedDescription,
			parsedSolutionHash,
			parsedReward,
		)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

type setScavengeRequest struct {
	BaseReq      rest.BaseReq   `json:"base_req"`
	ID           string         `json:"id"`
	Creator      string         `json:"creator"`
	Description  string         `json:"description"`
	SolutionHash string         `json:"solutionHash"`
	Reward       string         `json:"reward"`
	Solution     string         `json:"solution"`
	Scavenger    sdk.AccAddress `json:"scavenger"`
}

func setScavengeHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req setScavengeRequest
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

		parsedDescription := req.Description

		parsedSolutionHash := req.SolutionHash

		parsedReward := req.Reward

		parsedSolution := req.Solution

		parsedScavenger := req.Scavenger

		msg := types.NewMsgSetScavenge(
			creator,
			parsedDescription,
			parsedSolutionHash,
			parsedReward,
			parsedSolution,
			parsedScavenger,
		)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

type deleteScavengeRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string       `json:"creator"`
	ID      string       `json:"id"`
}

func deleteScavengeHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req deleteScavengeRequest
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
		msg := types.NewMsgDeleteScavenge(req.ID, creator)

		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
