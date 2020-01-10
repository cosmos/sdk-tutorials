package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Query endpoints supported by the scavenge querier
const (
	QueryParams    = "params"
	//TODO: Describe query parametes
)

/* 
Below you will be able how to set your own queries:

QueryInfoParams defines the params for the following queries:
- 'custom/scavenge/signingInfo'
type QueryParams struct {
	ConsAddress sdk.ConsAddress
}

NewQueryInfoParams creates a new QueryInfoParams instance
func NewQueryInfoParams(consAddr sdk.ConsAddress) QueryInfoParams {
	return QueryInfoParams{consAddr}
}
*/