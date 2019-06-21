# Types

First Thing we're going to do is define a struct that holds all the metadata of a name. We will call this struct Whois after the ICANN DNS terminology.

## `types.go`

Begin by creating the file `./x/nameservice/types/types.go` to hold the customs types for your module. In Cosmos SDK applications, the convention is that modules live in the `./x/` folder.

## Whois

Each name will have three pieces of data associated with it.

- Value - The value that a name resolves to. This is just an arbitrary string, but in the future you can modify this to require it fitting a specific format, such as an IP address, DNS Zone file, or blockchain address.
- Owner - The address of the current owner of the name
- Price - The price you will need to pay in order to buy the name

To start your SDK module, define your `nameservice.Whois` struct in the `./x/nameservice/types/types.go` file:

```go
package types

import (
	"fmt"
	"strings"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Whois is a struct that contains all the metadata of a name
type Whois struct {
	Value string         `json:"value"`
	Owner sdk.AccAddress `json:"owner"`
	Price sdk.Coins      `json:"price"`
}
```

As mentioned in the [Design doc](./app-design.md), if a name does not already have an owner, we want to initialize it with some MinPrice.

```go
// Initial Starting Price for a name that was never previously owned
var MinNamePrice = sdk.Coins{sdk.NewInt64Coin("nametoken", 1)}

// Returns a new Whois with the minprice as the price
func NewWhois() Whois {
	return Whois{
		Price: MinNamePrice,
	}
}

// implement fmt.Stringer
func (w Whois) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Owner: %s
Value: %s
Price: %s`, w.Owner, w.Value, w.Price))
}
```

### Now we can create our [key file](./key.md)
