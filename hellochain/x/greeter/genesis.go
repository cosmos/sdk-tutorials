package greeter

// TODO import our grreeter types
import (
	"encoding/json"

	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

// InitGenesis initialize default parameters
// and the keeper's address to pubkey map
/* TODO: Define what keepers the module needs */
func InitGenesis(ctx sdk.Context, bz json.RawMessage) []abci.ValidatorUpdate {
	var genesisState GenesisState

	//New genesisState = NewGenesisState()
	ModuleCdc.MustUnmarshalJSON(bz, &genesisState)
	for _, greeting := range genesisState.GreetingsList {
		if greeting.Body != nil {
			err, greeting := Keeper.AppendGreeting(ctx, greeting.Recipient, greeting)
		}
	}
	if err != nil {
		return err
	}
	return []abci.ValidatorUpdate{}
}

// TODO: Define logic for when you would like to initalize a new genesis
// for hellochain we will omit any logic here

// ExportGenesis writes the current store values
// to a genesis file, which can be imported again
// with InitGenesis
func ExportGenesis(ctx sdk.Context, k Keeper) (data GenesisState) {
	var lists []GreetingList
	iterator := k.GetGreetingsIterator(ctx)
	for ; iterator.Valid(); iterator.Next() {

		recipient, err := (iterator.Key())
		greetings := k.GetGreetings(ctx, recipient)
		records = append(records, whois)
	}

}
