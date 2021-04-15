---
order: 4
---

# Keys

Start by navigating to the `keys.go` file in the `types` folder. Within the `keys.go` file, you will see that the keys which will be used throughout the creation of the module have already been created.


```go
package types

const (
	// ModuleName defines the module name
	ModuleName = "nameservice"

	// StoreKey defines the primary module store key
	StoreKey = ModuleName

	// RouterKey is the message route for slashing
	RouterKey = ModuleName

	// QuerierRoute defines the module's query routing key
	QuerierRoute = ModuleName

	// MemStoreKey defines the in-memory store key
	MemStoreKey = "mem_capability"
)

func KeyPrefix(p string) []byte {
	return []byte(p)
}

const (
	WhoisKey      = "Whois-value-"
	WhoisCountKey = "Whois-count-"
)
```
