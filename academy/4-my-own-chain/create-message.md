---
title: Create a Game Message
order: 6
description: You introduce the message to create a game
tag: deep-dive
---

# Create a Game Message

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md) and [messages](../2-main-concepts/messages.md)) and [Protobuf](../2-main-concepts/protobuf.md).
* Have Go installed.
* The checkers blockchain scaffold with the `StoredGame` and its helpers. You can get there by following the [previous steps](./stored-game.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/full-game-object).

</HighlightBox>

Right now:

* Your game objects have been defined in storage.
* You prevented a simple CRUD to set the objects straight from transactions.

Now you need a message to instruct the checkers blockchain to create a game. This message needs to:

* Not specify the creator: this is implicit because it shall be the signer of the message.
* Not specify the ID of the game because the system uses an incrementing counter. On the other hand, the server needs to return the newly created ID value since the eventual value cannot be known before the transaction is included in a block and the state computed. Call this `idValue`.
* Not specify the game board as it is under the full control of the checkers rules.
* Specify who is playing reds. Call the field `red`.
* Specify who is playing blacks. Call the field `black`.

Instruct Starport to take care of all this:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

It creates a [certain number of files](https://github.com/cosmos/b9-checkers-academy-draft/commit/e78cba34926ba0adee23febb1ce44774e2c466b3) plus [some GUI elements](https://github.com/cosmos/b9-checkers-academy-draft/commit/dcf9f4724570146c8e0ad339aafb469d27dca0b9).

## Protobuf objects

Simple Protobuf objects are created:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/proto/checkers/tx.proto#L15-L23]
message MsgCreateGame {
    string creator = 1;
    string red = 2;
    string black = 3;
}

message MsgCreateGameResponse {
    string idValue = 1;
}
```

Which, when compiled for instance with `starport generate proto-go` yield:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/x/checkers/types/tx.pb.go#L31-L35]
type MsgCreateGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    Red     string `protobuf:"bytes,2,opt,name=red,proto3" json:"red,omitempty"`
    Black   string `protobuf:"bytes,3,opt,name=black,proto3" json:"black,omitempty"`
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/x/checkers/types/tx.pb.go#L91-L93]
type MsgCreateGameResponse struct {
    IdValue string `protobuf:"bytes,1,opt,name=idValue,proto3" json:"idValue,omitempty"`
}
```

Files were generated to serialize the pair which are named `*.pb.go`. **Caution:** you should not edit these files.

Starport also registered `MsgCreateGame` as a concrete message type with the two (de-)serialization engines:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/types/codec.go#L14]
func RegisterCodec(cdc *codec.LegacyAmino) {
    cdc.RegisterConcrete(&MsgCreateGame{}, "checkers/CreateGame", nil)
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/types/codec.go#L20-L22]
func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
    registry.RegisterImplementations((*sdk.Msg)(nil),
        &MsgCreateGame{},
    )
    ...
}
```

Which is code that you probably do not need to change.

Starport also creates boilerplate code to have the message conform to the [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) type:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/types/message_create_game.go#L26-L32]
func (msg *MsgCreateGame) GetSigners() []sdk.AccAddress {
    creator, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        panic(err)
    }
    return []sdk.AccAddress{creator}
}
```

This code is created only once. You can modify it as you see fit.

## Protobuf service interface

Starport also adds a new function to your gRPC interface that receives all transaction messages for the module because the message is meant to be sent and received. The interface is called `service Msg` and is declared inside `proto/checkers/tx.proto`.

Starport creates this [`tx.proto`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6ef4b2deb996e54f18f597b24fafbf02e1/proto/checkers/tx.proto) file at the beginning when you scaffold your project's module. Starport separates different concerns into different files so that it knows where to add elements according to instructions received. Starport adds a function to the empty `service Msg` with your instruction.

The new function receives this `MsgCreateGame`, namely:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/proto/checkers/tx.proto#L11]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```

As an interface it does not describe what should happen when called. What Starport does with the help of Protobuf is compile the interface and create a default Go implementation.

## Interact via the CLI

Time to see which new CLI command was created by Starport:

```sh
$ checkersd tx checkers --help
...
Available Commands:
  create-game Broadcast message createGame
```

And also:

```sh
$ checkersd tx checkers create-game --help
...
Usage:
  checkersd tx checkers create-game [red] [black] [flags]

Flags:
   -a, --account-number uint      The account number of the signing account (offline mode only)
   -b, --broadcast-mode string    Transaction broadcasting mode (sync|async|block) (default "sync")
       --dry-run                  ignore the --gas flag and perform a simulation of a transaction, but don\`t broadcast it
       --fees string              Fees to pay along with transaction; eg: 10uatom
       --from string              Name or address of private key with which to sign
       --gas string               gas limit to set per-transaction; set to "auto" to calculate sufficient gas automatically (default 200000)
...
```

You kept the two accounts that were created by Starport. Have `alice` start a game with `bob`. Instead of having to copy and paste the addresses each time you need them, you can store these as variables:

```sh
$ export alice=$(checkersd keys show alice -a)
$ export bob=$(checkersd keys show bob -a)
```

 How much gas is needed? You can get an estimate by dry running the transaction using the `--dry-run` flag:

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --dry-run
gas estimate: 40452
```

That is not much. Thus, `auto` is enough:

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
{"body":{"messages":[{"@type":"/alice.checkers.checkers.MsgCreateGame","creator":"cosmos1wh7scjfhgzeqxfxhqq6jh59sj2y8d7u97qu7qp","red":"cosmos1wh7scjfhgzeqxfxhqq6jh59sj2y8d7u97qu7qp","black":"cosmos199krg6nz4qgv53nvrx9gj7nrlg48clwurn82jy"}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[],"gas_limit":"40412","payer":"","granter":""}},"signatures":[]}

confirm transaction before signing and broadcasting [y/N]: y
code: 0
codespace: ""
data: 0A0C0A0A43726561746547616D65
gas_used: "38891"
gas_wanted: "40412"
height: "3905"
info: ""
logs:
- events:
  - attributes:
    - key: action
      value: CreateGame
    type: message
  log: ""
  msg_index: 0
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"CreateGame"}]}]}]'
timestamp: ""
tx: null
txhash: 59BC309EF79C354DD46ECE8D882BE133699CC10B165FEFAFF6AF3717507EBB4F
```

You can query your chain to see if the new game has been saved to state:

```sh
$ checkersd query checkers show-next-game
NextGame:
  creator: ""
  idValue: "0"

$ checkersd query checkers list-stored-game
StoredGame: []
pagination:
  next_key: null
  total: "0"
```

It looks like nothing has changed. Starport only created a message, but you did not yet implement what actions the chain should undertake when it receives this message. That's what you'll take care of in the [next section](./create-handling.md).

## Next up

Starport separates concerns into different files. The most relevant file for you at this point is `x/checkers/keeper/msg_server_create_game.go` which is created once. You need to code in the creation of the game proper in this file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```
This is the object of the [next section](./create-handling.md).

<!-- Add GUI Elements -->
