---
title: "Create Custom Messages for Your Checkers Blockchain"
order: 7
description: Introduce the message to create a game
tag: deep-dive
---

# Create Custom Messages for Your Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have everthing you need before proceeding:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain scaffold with the `StoredGame` and its helpers. If not, follow the [previous steps](./stored-game.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/full-game-object).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Create a game Protobuf object.
* Create a game Protobuf service interface.
* Extend your unit tests.
* Interact via the CLI.

</HighlightBox>

You have created your game object type and have decided how to lay games in storage. Time to make it possible for participants to create games. 

## Some initial thoughts

Because this operation changes the state, it has to originate from transactions and messages. Your module receives a message to create a game - what should go into this message? Questions that you have to answer include:

* Who is allowed to create a game?
* Are there any limitations to creating games?
* Given that a game involves two players, how do you prevent coercion and generally foster good behavior?
* Do you want to establish leagues?

Your implementation does not have to answer everything immediately, but you should be careful that decisions made now do not impede your own future plans or make things more complicated later.

Keep it simple: a single message should be enough to create a game.

## Code needs

As before:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your addition?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

Run the commands, make the adjustments, run some tests. **Create the message only**, do not create any games in storage for now.

## Create the message

Currently:

* Your game objects have been defined in storage.
* You prevented a simple CRUD to set the objects straight from transactions.

Now you need a message to instruct the checkers blockchain to create a game. This message needs to:

* Not specify the creator: this is implicit because it shall be the signer of the message.
* Not specify the ID of the game, because the system uses an incrementing counter. However, the server needs to return the newly created ID value, since the eventual value cannot be known before the transaction is included in a block and the state computed. Call this `idValue`.
* Not specify the game board as this is controlled by the checkers rules.
* Specify who is playing with the red pieces. Call the field `red`.
* Specify who is playing with the black pieces. Call the field `black`.

Instruct Ignite CLI to do all of this:

```sh
$ ignite scaffold message createGame red black --module checkers --response idValue
```

This creates a [certain number of files](https://github.com/cosmos/b9-checkers-academy-draft/commit/e78cba34926ba0adee23febb1ce44774e2c466b3) plus [some GUI elements](https://github.com/cosmos/b9-checkers-academy-draft/commit/dcf9f4724570146c8e0ad339aafb469d27dca0b9).

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

When compiled, for instance with `ignite generate proto-go`, these yield:

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

<HighlightBox type="warn">

Files were generated to serialize the pair which are named `*.pb.go`. You should not edit these files.

</HighlightBox>

Ignite CLI also registered `MsgCreateGame` as a concrete message type with the two (de-)serialization engines:

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

This is code that you probably do not need to change.

Ignite CLI also creates boilerplate code to have the message conform to the [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) type:

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

Ignite CLI also adds a new function to your gRPC interface that receives all transaction messages for the module, because the message is meant to be sent and received. The interface is called `service Msg` and is declared inside `proto/checkers/tx.proto`.


<HighlightBox type="info">

Ignite CLI creates this [`tx.proto`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6/proto/checkers/tx.proto) file at the beginning when you scaffold your project's module. Ignite CLI separates different concerns into different files so that it knows where to add elements according to instructions received. Ignite CLI adds a function to the empty `service Msg` with your instruction.

</HighlightBox>

The new function receives this `MsgCreateGame`, namely:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/proto/checkers/tx.proto#L11]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```

As an interface, it does not describe what should happen when called. With the help of Protobuf, Ignite CLI compiles the interface and creates a default Go implementation.

## Unit tests

The code of this section was created by Ignite CLI, so there is no point in testing it. However, since you are going to adjust the keeper to do what you want, why not add a test file? Add `keeper/msg_server_create_game_test.go` with:

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

You can test this with:

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

This convenient [`setupMsgServer`](https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_test.go#L11-L14) function was created by Ignite CLI. To call this a _unit_ test is a slight misnomer because the `msgServer` created uses a real context and keeper, although with a [memory database](https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/keeper_test.go#L22), not mocks.

## Interact via the CLI

Time to see which new CLI command was created by Ignite CLI:

```sh
$ checkersd tx checkers --help
```

Among other things, this informs you of the following:

```
...
Available Commands:
  create-game Broadcast message createGame
```

And also:

```sh
$ checkersd tx checkers create-game --help
```

This returns:

```
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

You kept the two accounts created by Ignite CLI.

Have `alice` start a game with `bob`.

<HighlightBox type="remember">

Instead of having to copy and paste the addresses each time you need them, you can store these as variables:

```sh
$ export alice=$(checkersd keys show alice -a)
$ export bob=$(checkersd keys show bob -a)
```

You will have to redo this for every new shell, and for every use of the `--reset-once` flag.

</HighlightBox>

How much gas is needed? You can get an estimate by dry running the transaction using the `--dry-run` flag:

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --dry-run
```

This prints:

```
gas estimate: 40452
```

It is hard to assess how much gas that represents. In any case, keep gas on `auto`:

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

<ExpansionPanel title="The command prints a lot and prompts you for confirmation">

```
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

</ExpansionPanel>

You can query your chain to check if the new game was saved to state:

<CodeGroup>
<CodeGroupItem title="Show next game" active>

```sh
$ checkersd query checkers show-next-game
```

This returns:

```
NextGame:
  creator: ""
  idValue: "1"
```

</CodeGroupItem>
<CodeGroupItem title="List stored game">

```sh
$ checkersd query checkers list-stored-game
```

This returns:

```
StoredGame: []
pagination:
  next_key: null
  total: "0"
```

</CodeGroupItem>
</CodeGroup>

---

It appears that nothing changed. Ignite CLI created a message, but you have not yet implemented what actions the chain should undertake when it receives this message.

## Next up

Ignite CLI separates concerns into different files. The most relevant file currently is `x/checkers/keeper/msg_server_create_game.go`, which is created once. The creation of the game is coded into this file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/eea2618/x/checkers/keeper/msg_server_create_game.go#L13]
// TODO: Handling the message
```

You need to code in it the creation of the game properly. This is the object of the [next section](./create-handling.md).

<!-- Add GUI Elements -->
