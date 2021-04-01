package rest

import (
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client/context"
)

// RegisterRoutes registers voter-related REST handlers to a router
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router) {
  // this line is used by starport scaffolding # 1
		r.HandleFunc("/voter/vote", createVoteHandler(cliCtx)).Methods("POST")
		r.HandleFunc("/voter/vote", listVoteHandler(cliCtx, "voter")).Methods("GET")
		r.HandleFunc("/voter/vote/{key}", getVoteHandler(cliCtx, "voter")).Methods("GET")
		r.HandleFunc("/voter/vote", setVoteHandler(cliCtx)).Methods("PUT")
		r.HandleFunc("/voter/vote", deleteVoteHandler(cliCtx)).Methods("DELETE")

		
		r.HandleFunc("/voter/poll", createPollHandler(cliCtx)).Methods("POST")
		r.HandleFunc("/voter/poll", listPollHandler(cliCtx, "voter")).Methods("GET")
		r.HandleFunc("/voter/poll/{key}", getPollHandler(cliCtx, "voter")).Methods("GET")
		r.HandleFunc("/voter/poll", setPollHandler(cliCtx)).Methods("PUT")
		r.HandleFunc("/voter/poll", deletePollHandler(cliCtx)).Methods("DELETE")

		
}
