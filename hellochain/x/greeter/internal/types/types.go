package types

import (
	"fmt"
	"strings"

	codec "github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
	// ModuleName is the name of the module
	ModuleName = "greeter"

	// StoreKey is used to register the module's store
	StoreKey = ModuleName
)

var (
	// ModuleCdc contains the types for the module that require encoding in amino
	ModuleCdc = codec.New()
)

// struct containing the data of the Greeting. json and yaml tags are used to specify field names
// when marshalled to json
type Greeting struct {
	Sender    sdk.AccAddress `json:"sender" yaml:"sender"`     // address of the account "sending" the greeting
	Recipient sdk.AccAddress `json:"receiver" yaml:"receiver"` // address of the account "receiving" the greeting
	Body      string         `json:"body" yaml:"body"`         // string body of the greeting
}

// GreetingsList stores all the greeting for a given address
type GreetingsList []Greeting

// NewGreeting Returns a new Greeting
func NewGreeting(sender sdk.AccAddress, body string, receiver sdk.AccAddress) Greeting {
	return Greeting{
		Recipient: receiver,
		Sender:    sender,
		Body:      body,
	}
}

// implement fmt.Stringer
func (g Greeting) String() string {
	return strings.TrimSpace(
		fmt.Sprintf(`Sender: %s Recipient: %s Body: %s`, g.Sender.String(), g.Recipient.String(),
			g.Body),
	)
}

// QueryResGreetings defines the response to our Querier, containing greetings for a given address
type QueryResGreetings map[string][]Greeting

func (q QueryResGreetings) String() string {
	b := ModuleCdc.MustMarshalJSON(q)
	return string(b)
}

// NewQueryResGreetings constructs a new instance
func NewQueryResGreetings() QueryResGreetings {
	return make(map[string][]Greeting)
}
