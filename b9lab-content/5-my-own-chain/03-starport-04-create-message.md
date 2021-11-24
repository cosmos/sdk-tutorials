---
title: Create a Game Message
order: 6
description: You create the message to create a game
---

# Create a Game Message

Now that your game objects have been defined in the storage. Since you prevented, for good reason, a simple CRUD to set the objects, you need a message to instruct the checkers' blockchain to create a game.

The message needs to:

* Not specify the creator: this is implicit because it shall be the signer of the message.
* Not specify the ID of the game because the system uses an incrementing counter. On the other hand, the server needs to return the newly created ID value since the eventual value cannot be known before the transaction is included in a block and the state computed. Let's call this `idValue`.
* Not specify the game board as it is under the full control of the checkers rules.
* Specify who is playing reds. Let's call the field `red`.
* Specify who is playing blacks. Let's call the field: `black`.

Let's instruct Starport to take care of all this:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

This creates a [certain number of files](https://github.com/cosmos/b9-checkers-academy-draft/commit/e78cba34926ba0adee23febb1ce44774e2c466b3), plus [some GUI elements](https://github.com/cosmos/b9-checkers-academy-draft/commit/dcf9f4724570146c8e0ad339aafb469d27dca0b9).

## Protobuf objects

Again, simple Protobuf objects are created:

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

Which, when compiled yield:

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

Plus the boilerplate to serialize the pair, which are files named `*.pb.go`. You should not edit these files.

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

Which is code that you, probably, do not need to change.

Starport also creates boilerplate code to have the message conform to the `sdk.Msg` type, like:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/types/message_create_game.go#L26-L32]
func (msg *MsgCreateGame) GetSigners() []sdk.AccAddress {
    creator, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        panic(err)
    }
    return []sdk.AccAddress{creator}
}
```

This code is created only once. Therefore, you can modify it as you see fit.

## Protobuf service interface

Starport also adds a new function to your gRPC interface that receives all transaction messages for the module, because the message is meant to be sent and received. The interface is called `service Msg` and is declared inside `proto/checkers/tx.proto`.

Starport creates this `tx.proto` file at the beginning when you create your project. This is Starport's modus operandi: Starport files different concerns into different files so that it knows where to add elements according to instructions received. Here, Starport adds a function to the empty `service Msg`.

The new function receives this `MsgCreateGame`, namely:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/proto/checkers/tx.proto#L11]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```

As an interface it does not describe what should happen when called, though. What Starport does, with the help of Protobuf, is compile the interface and create a default Go implementation.

Since you are responsible to define "creating a game", Starport separates concerns into different files. At this point, the most relevant for you is `x/checkers/keeper/msg_server_create_game.go`, which is created once. In this file, you need to code in the creation of the game proper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```
This is the object of the [next section](./.md).

<!-- Add GUI Elements -->
