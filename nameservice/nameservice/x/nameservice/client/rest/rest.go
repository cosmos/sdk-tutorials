package rest

import (
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client"
	// this line is used by starport scaffolding # 1
)

const (
	MethodGet = "GET"
)

// RegisterRoutes registers nameservice-related REST handlers to a router
func RegisterRoutes(clientCtx client.Context, r *mux.Router) {
	// this line is used by starport scaffolding # 2
	registerQueryRoutes(clientCtx, r)
	registerTxHandlers(clientCtx, r)

}

func registerQueryRoutes(clientCtx client.Context, r *mux.Router) {
	// this line is used by starport scaffolding # 3
	r.HandleFunc("/nameservice/whois/{id}", getWhoisHandler(clientCtx)).Methods("GET")
	r.HandleFunc("/nameservice/whois", listWhoisHandler(clientCtx)).Methods("GET")

}

func registerTxHandlers(clientCtx client.Context, r *mux.Router) {
	// this line is used by starport scaffolding # 4
	r.HandleFunc("/nameservice/whois", createWhoisHandler(clientCtx)).Methods("POST")
	r.HandleFunc("/nameservice/whois/{id}", updateWhoisHandler(clientCtx)).Methods("POST")
	r.HandleFunc("/nameservice/whois/{id}", deleteWhoisHandler(clientCtx)).Methods("POST")

}
