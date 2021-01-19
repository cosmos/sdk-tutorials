package types

const (
	// ModuleName is the name of the module
	ModuleName = "scavenge"

	// StoreKey to be used when creating the KVStore
	StoreKey = ModuleName

	// RouterKey to be used for routing msgs
	RouterKey = ModuleName

	// QuerierRoute to be used for querier msgs
	QuerierRoute = ModuleName
)

const (
	ScavengePrefix = "scavenge-value-"
	ScavengeCountPrefix = "scavenge-count-"
)
		
const (
	CommitPrefix = "commit-value-"
	CommitCountPrefix = "commit-count-"
)
		