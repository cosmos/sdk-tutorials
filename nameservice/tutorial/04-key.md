---
order: 4
---

# Key

Start by creating a key.go file in the types folder. Within your key.go file, you will set your keys to be used throughout the creation of the module.

Defining the keys that will be used throughout the application helps with writing DRY code.

```go
package types

const (
	// module name
	ModuleName = "nameservice"

	// StoreKey to be used when creating the KVStore
	StoreKey = ModuleName
)
```
