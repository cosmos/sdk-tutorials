package rest

import (
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client/context"
)

// RegisterRoutes registers scavenge-related REST handlers to a router
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router) {
  // this line is used by starport scaffolding
	r.HandleFunc("/scavenge/commit", listCommitHandler(cliCtx, "scavenge")).Methods("GET")
	r.HandleFunc("/scavenge/commit", createCommitHandler(cliCtx)).Methods("POST")
	r.HandleFunc("/scavenge/scavenge", listScavengeHandler(cliCtx, "scavenge")).Methods("GET")
	r.HandleFunc("/scavenge/scavenge", createScavengeHandler(cliCtx)).Methods("POST")
}
