package rest

import (
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client/context"
)

// RegisterRoutes registers pofe-related REST handlers to a router
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router) {
  // this line is used by starport scaffolding # 1
		r.HandleFunc("/pofe/claim", createClaimHandler(cliCtx)).Methods("POST")
		r.HandleFunc("/pofe/claim", listClaimHandler(cliCtx, "pofe")).Methods("GET")
		r.HandleFunc("/pofe/claim/{key}", getClaimHandler(cliCtx, "pofe")).Methods("GET")
		r.HandleFunc("/pofe/claim", setClaimHandler(cliCtx)).Methods("PUT")
		r.HandleFunc("/pofe/claim", deleteClaimHandler(cliCtx)).Methods("DELETE")

		
}
