---
title: Message - Create a Message to Create a Game
order: 6
description: You introduce the message to create a game
tag: deep-dive
---

# Message - Create a Message to Create a Game

<HighlightBox type="synopsis">

Make sure you have everthing you need before proceeding:

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
* Specify who is playing with the red pieces. Call the field `red`.
* Specify who is playing with the black pieces. Call the field `black`.

Instruct Starport to take care of all this:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

It creates a [certain number of files](https://github.com/cosmos/b9-checkers-academy-draft/commit/e78cba34926ba0adee23febb1ce44774e2c466b3) plus [some GUI elements](https://github.com/cosmos/b9-checkers-academy-draft/commit/dcf9f4724570146c8e0ad339aafb469d27dca0b9).

## Protobuf objects

Simple Protobuf objects are created:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/proto/checkers/tx.proto#L15-L23]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/types/tx.pb.go#L31-L35]
type MsgCreateGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    Red     string `protobuf:"bytes,2,opt,name=red,proto3" json:"red,omitempty"`
    Black   string `protobuf:"bytes,3,opt,name=black,proto3" json:"black,omitempty"`
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/types/tx.pb.go#L91-L93]
type MsgCreateGameResponse struct {
    IdValue string `protobuf:"bytes,1,opt,name=idValue,proto3" json:"idValue,omitempty"`
}
```

Files were generated to serialize the pair which are named `*.pb.go`. **Caution:** you should not edit these files.

Starport also registered `MsgCreateGame` as a concrete message type with the two (de-)serialization engines:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/types/codec.go#L14]
func RegisterCodec(cdc *codec.LegacyAmino) {
    cdc.RegisterConcrete(&MsgCreateGame{}, "checkers/CreateGame", nil)
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/types/codec.go#L20-L22]
func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
    registry.RegisterImplementations((*sdk.Msg)(nil),
        &MsgCreateGame{},
    )
    ...
}
```

Which is code that you probably do not need to change.

Starport also creates boilerplate code to have the message conform to the [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) type:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/types/message_create_game.go#L26-L32]
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

Starport creates this [`tx.proto`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6/proto/checkers/tx.proto) file at the beginning when you scaffold your project's module. Starport separates different concerns into different files so that it knows where to add elements according to instructions received. Starport adds a function to the empty `service Msg` with your instruction.

The new function receives this `MsgCreateGame`, namely:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/proto/checkers/tx.proto#L11]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```

As an interface it does not describe what should happen when called. What Starport does with the help of Protobuf is compile the interface and create a default Go implementation. It does this once, this is its implementation, in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

## Unit tests

The code of this section was created by Starport, so there is no point in testing it. However, since you are going to adjust the keeper to do what you want, why not add a test file. Add `keeper/msg_server_create_game_test.go` with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_create_game_test.go]
const (
    alice = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
    bob   = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
    carol = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
)

func TestCreateGame(t *testing.T) {
    msgServer, context := setupMsgServer(t)
    createResponse, err := msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
    })
    require.Nil(t, err)
    require.EqualValues(t, types.MsgCreateGameResponse{
        IdValue: "", // TODO: update with a proper value when updated
    }, *createResponse)
}
```

Which you can test with:

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

Yes, this convenient [`setupMsgServer`](https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_test.go#L11-L14) function was created by Starport. This _unit_ test is a bit of a misnomer because the `msgServer` created uses a real context and keeper, although with a [memory database](https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/keeper_test.go#L22), not mocks.

## Next up

Starport separates concerns into different files. The most relevant file for you at this point is `x/checkers/keeper/msg_server_create_game.go`. As is obvious from its content:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_create_game.go#L13]
// TODO: Handling the message
```

You need to code in it the creation of the game proper. This is the object of the [next section](./create-handling.md).

<!-- Add GUI Elements -->
