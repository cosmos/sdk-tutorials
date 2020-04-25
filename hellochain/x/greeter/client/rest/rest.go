package rest

import (
	"fmt"
	"github.com/gorilla/mux"

	"github.com/cosmos/cosmos-sdk/client/context"
)

// RegisterRoutes registers mod-example-related REST handlers to a router

const (
	restName = "greeter"
)

// RegisterRoutes - Central function to define routes that get registered by the main application
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router, storeName string) {
	r.HandleFunc(fmt.Sprintf("/%s/greet", storeName), GreetHandler(cliCtx)).Methods("POST")
	r.HandleFunc(fmt.Sprintf("/%s/greetings/{%s}", storeName, restName), queryGreetingsHandler(cliCtx, storeName)).Methods("GET")
}
