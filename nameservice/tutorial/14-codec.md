---
order: 14
---

# Codec File

To [register your types with Amino](https://github.com/tendermint/go-amino#registering-types) so that they can be encoded/decoded, there is a bit of code that needs to be placed in `./x/nameservice/types/codec.go`. Any interface you create and any struct that implements an interface needs to be declared in the `RegisterCodec` function. In this module the three `Msg` implementations (`SetName`, `BuyName` and `DeleteName`) need to be registered, but your `Whois` query return type does not. In addition, we define a module specific codec for use later.

<<< @/nameservice/x/nameservice/types/codec.go

### Next you need to define CLI interactions with your module.
