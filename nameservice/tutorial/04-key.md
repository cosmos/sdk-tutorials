---
order: 4
---

# Key

Start by navigating to the `key.go` file in the types folder. Within the `key.go` file, you will see that the keys which will be used throughout the creation of the module have already been created.

Defining keys that will be used throughout the application helps with writing [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code.

```go
package types

const (
	// module name
	ModuleName = "nameservice"

	// StoreKey to be used when creating the KVStore
	StoreKey = ModuleName

	// RouterKey to be used for routing msgs
	RouterKey = ModuleName

	QuerierRoute = ModuleName
)
```
