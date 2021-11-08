---
title: The Create Game Message
order: 6
description: You create the message to create a game.
---

# The Create Game Message

Now that your game objects have been defined in storage, and since you prevented, for good reason, a simple CRUD to set them, you need a message to instruct the checkers blockchain to create a game. What do you need it to expose?

* It does not need to specify the creator. Or rather, this is implicit because it shall be the signer of the message.
* It does not need to specify the id of the game because the system uses an incrementing counter. On the other hand, the server needs to return the newly created id value since the eventual value cannot be known before the transaction is included in a block and the state computed. Let's call this `idValue`.
* It does not need to specify the game board as it is under the full control of the checkers rules.
* It needs to specify who is playing reds, let's call the field: `red`.
* It needs to specify who is playing blacks, let's call the field: `black`.

That's not much, so again, let's instruct Starport to take care of all this:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```
This has created a certain number of files as can be seen [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/e78cba34926ba0adee23febb1ce44774e2c466b3), plus GUI elements seen [there](https://github.com/cosmos/b9-checkers-academy-draft/commit/dcf9f4724570146c8e0ad339aafb469d27dca0b9).

## Protobuf Objects

Again, it created simple Protobuf objects:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/proto/checkers/tx.proto#L15-L23]
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
Plus the boilerplate to serialize the pair, which are files named `*.pb.go` that you should not edit. Starport also registered `MsgCreateGame` as a concrete message type with the two (de)serialization engines:

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
Which is code that you probably need not change.

Other boilerplate created by Starport is code to have the message conform to the `sdk.Msg` type like:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/types/message_create_game.go#L26-L32]
func (msg *MsgCreateGame) GetSigners() []sdk.AccAddress {
    creator, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        panic(err)
    }
    return []sdk.AccAddress{creator}
}
```
This is code that is created only once and therefore that you can modify as you see fit.

## Protobuf Service Interface

Now, because this is a message that is meant to be sent and received, Starport also added a new function to your gRPC interface that receives all transaction messages for the module. This interface is called `service Msg` and is declared inside `proto/checkers/tx.proto`. Starport created this `tx.proto` file at the beginning when you created your project. This is Starport's modus operandi, it files different concerns into different files so that it knows where to add elements when you instruct it. That's what it did here, adding a function to the empty `service Msg`.

The new function will receive this `MsgCreateGame`. Namely:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/b3cf9ea4c554158e950bcfe58803e53eefc31090/proto/checkers/tx.proto#L11]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```
As an interface it does not describe what should happen when called, though. What Starport does, with the help of Protobuf, is compile the interface and create a default Go implementation. Now, since you are responsible for what creating a game means, Starport separated concerns into different files. The most relevant for you at this point is `x/checkers/keeper/msg_server_create_game.go`. It is created once and this is where you need to code the creation of the game proper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```
This is the object of the next section.

<!-- Add GUI Elements -->
