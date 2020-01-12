package types

import "strings"

// query endpoints supported by the nameservice Querier
const (
	QueryListScavenges = "list"
	QueryGetScavenge   = "get"
	QueryCommit        = "commit"
)

// // QueryResResolve Queries Result Payload for a resolve query
// type QueryResResolve struct {
// 	Value string `json:"value"`
// }

// // implement fmt.Stringer
// func (r QueryResResolve) String() string {
// 	return r.Value
// }

// QueryResScavenges Queries Result Payload for a names query
type QueryResScavenges []string

// implement fmt.Stringer
func (n QueryResScavenges) String() string {
	return strings.Join(n[:], "\n")
}
