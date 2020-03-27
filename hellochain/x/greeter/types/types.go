package types

import (
	"fmt"
	"strings"

	sdk "github.com/cosmos/cosmos-sdk/types"
	yaml "gopkg.in/yaml.v2"
)

const (
	// ModuleName is the name of the module
	ModuleName = "greeter"
	// StoreKey is used to register the module's store
	StoreKey = ModuleName
)

// Greeting is a struct that contains all the metadata of a name
type Greeting struct {
	Sender    sdk.AccAddress `json:"sender" yaml:"sender"`
	Recipient sdk.AccAddress `json:"receiver" yaml:"receiver"`
	Body      string         `json:"body" yaml:"body"`
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
	return strings.TrimSpace(fmt.Sprintf(`Sender: %s Recipient: %s Body: %s`, g.Sender.String(), g.Recipient.String(), g.Body))

}

// QueryResGreetings defines the response to our Querier, containing greetings for a given address
type QueryResGreetings map[string][]Greeting

func (q QueryResGreetings) String() string {
	b, err := yaml.Marshal(q)
	if err != nil {
		panic(err)
	}
	return string(b)
}

// NewQueryResGreetings constructs a new instance
func NewQueryResGreetings() QueryResGreetings {
	return make(map[string][]Greeting)
}
