package types

// GenesisState - all greeter state that must be provided at genesis
//TODO specify empty genesis state struct
type GenesisState struct {
	Greetings map[string]GreetingsList `json:greeting_lists"`
}

type DefaultGenesisState struct {
	Greetings map[string]GreetingsList `json:greeting_lists"`
}

//TODO define greeter Genesis statefor exporting/importing chain state to json
func NewGenesisState(greetingLists map[string]GreetingsList) GenesisState {
	return GenesisState{}
}

// ValidateGenesis validates the greeter genesis parameters
func ValidateGenesis(data GenesisState) error {
	// TODO: Create a sanity check to make sure the state conforms to the modules needs

	return nil
}
