package types

// GenesisState - all greeter state that must be provided at genesis
type GenesisState struct {
	GreetingsList GreetingsList `json:"greetings_list"`
}

func DefaultGenesisState() GenesisState {
	return GenesisState{}
}

func NewGenesisState(greetingLists GreetingsList) GenesisState {
	return GenesisState{}
}
