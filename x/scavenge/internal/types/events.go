package types

// scavenge module event types
const (
	// TODO: Create your event types
	EventTypeCreateScavenge = "CreateScavenge"
	EventTypeUpdateScavenge = "UpdateScavenge"
	EventTypeCommitSolution = "CommitSolution"
	EventTypeSolveScavenge  = "SolveScavenge"

	// TODO: Create keys fo your events, the values will be derivided from the msg
	AttributeDescription           = "description"
	AttributeSolution              = "solution"
	AttributeSolutionHash          = "solutionHash"
	AttributeReward                = "reward"
	AttributeSolutionScavengerHash = "solutionScavengerHash"

	// TODO: Some events may not have values for that reason you want to emit that something happened.
	// AttributeValueDoubleSign = "double_sign"

	AttributeValueCategory = ModuleName
)
