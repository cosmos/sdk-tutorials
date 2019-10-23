---
order: 3
---

# Auction Type Exercise

## Folders

This is the first section that you will have to code. To get started you must

- create folder `x`
- within `x` you have to create a folder to house your module, in this case its `/auction`,
- finally within you module repo you must create two more folder, one within the first, like so `x/auction/internal/types`.

If you have made is this far your folder structure will look like this:

```
x/auction
└── internal
    └── types

```

## Auction

For our NFT auction module we need two primary types. You can place them in `auction.go` with in the types folder.

1. `Bid` type, this type should take the address of the bidder (type AccAddress), the bid (type Coins) and the nftID (type string).
2. `Auction` type, this type should take the `nftID` and `nftDenom` (type string), the current `bid`(type Bid), and the start and endtimes (type time.Time).
3. The `Auction` type should have a method to replace the current bid

**If you are new to go here is a hint on creating types:**

```go

type Name struct {
  Name    string `json:"name"`
  Amount  int    `json:"amount"`
  IsReal  bool   `json:"bool"`
}

```

Each type should have a constructor:

```go
func NewType(values needed for the type) type{
  return type{
    <values>
  }
}
```

and have a string function:

```go
func (t type) String() string {
  return fmt.Sprintf(`
  value: %s`,
  t.value)
}
```

### On the next page you will be able to see the answer.
