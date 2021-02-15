package rest

import (
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client"
    // this line is used by starport scaffolding # 1
)

const (
    MethodGet = "GET"
)

// RegisterRoutes registers pofe-related REST handlers to a router
func RegisterRoutes(clientCtx client.Context, r *mux.Router) {
    // this line is used by starport scaffolding # 2
	registerQueryRoutes(clientCtx, r)
	registerTxHandlers(clientCtx, r)

}

func registerQueryRoutes(clientCtx client.Context, r *mux.Router) {
    // this line is used by starport scaffolding # 3
    r.HandleFunc("/pofe/claims/{id}", getClaimHandler(clientCtx)).Methods("GET")
    r.HandleFunc("/pofe/claims", listClaimHandler(clientCtx)).Methods("GET")

}

func registerTxHandlers(clientCtx client.Context, r *mux.Router) {
    // this line is used by starport scaffolding # 4
    r.HandleFunc("/pofe/claims", createClaimHandler(clientCtx)).Methods("POST")
    r.HandleFunc("/pofe/claims/{id}", updateClaimHandler(clientCtx)).Methods("POST")
    r.HandleFunc("/pofe/claims/{id}", deleteClaimHandler(clientCtx)).Methods("POST")

}

