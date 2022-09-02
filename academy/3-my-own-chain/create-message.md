---
title: "Create Custom Messages for Your Checkers Blockchain"
order: 7
description: Introduce the message to create a game
tag: deep-dive
---

# Create Custom Messages for Your Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

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

* Not specify the ID of the game, because the system uses an incrementing counter. However, the server needs to return the newly created ID value, since the eventual value cannot be known before the transaction is included in a block and the state computed. Call this `gameIndex`.
* Not specify the game board as this is controlled by the checkers rules.
* Specify who is playing with the black pieces. Call the field `black`.
* Specify who is playing with the red pieces. Call the field `red`.

Instruct Ignite CLI to do all of this:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold message createGame black red --module checkers --response gameIndex
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold message createGame black red --module checkers --response gameIndex
```

</CodeGroupItem>

</CodeGroup>

This creates a [certain number of files](https://github.com/cosmos/b9-checkers-academy-draft/commit/66ae6e1) plus [some GUI elements](https://github.com/cosmos/b9-checkers-academy-draft/commit/0365f55).

## Protobuf objects

Simple Protobuf objects are created:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/proto/checkers/tx.proto#L14-L22]
message MsgCreateGame {
    string creator = 1;
    string black = 2;
    string red = 3;
}

message MsgCreateGameResponse {
    string gameIndex = 1;
}
```

When compiled, for instance with `ignite generate proto-go`, these yield:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/types/tx.pb.go#L30-L34]
type MsgCreateGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    Black   string `protobuf:"bytes,2,opt,name=black,proto3" json:"black,omitempty"`
    Red     string `protobuf:"bytes,3,opt,name=red,proto3" json:"red,omitempty"`
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/types/tx.pb.go#L90-L92]
type MsgCreateGameResponse struct {
    GameIndex string `protobuf:"bytes,1,opt,name=gameIndex,proto3" json:"gameIndex,omitempty"`
}
```

<HighlightBox type="warn">

Files were generated to serialize the pair which are named `*.pb.go`. You should not edit these files.

</HighlightBox>

Ignite CLI also registered `MsgCreateGame` as a concrete message type with the two (de-)serialization engines:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/types/codec.go#L11]
func RegisterCodec(cdc *codec.LegacyAmino) {
    cdc.RegisterConcrete(&MsgCreateGame{}, "checkers/CreateGame", nil)
}
```

And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/types/codec.go#L16-L18]
func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
    registry.RegisterImplementations((*sdk.Msg)(nil),
        &MsgCreateGame{},
    )
    ...
}
```

This is code that you probably do not need to change.

Ignite CLI also creates boilerplate code to have the message conform to the [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) type:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/types/message_create_game.go#L28-L34]
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

Ignite CLI creates this [`tx.proto`](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/tx.proto) file at the beginning when you scaffold your project's module. Ignite CLI separates different concerns into different files so that it knows where to add elements according to instructions received. Ignite CLI adds a function to the empty `service Msg` with your instruction.

</HighlightBox>

The new function receives this `MsgCreateGame`, namely:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/proto/checkers/tx.proto#L10]
service Msg {
    rpc CreateGame(MsgCreateGame) returns (MsgCreateGameResponse);
}
```

As an interface, it does not describe what should happen when called. With the help of Protobuf, Ignite CLI compiles the interface and creates a default Go implementation.

## Unit tests

The code of this section was created by Ignite CLI, so there is no point in testing it. However, since you are going to adjust the keeper to do what you want, you should add a test file for that. Add `keeper/msg_server_create_game_test.go`, declared with `package keeper_test`, and add in:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/msg_server_create_game_test.go]
const (
    alice = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
    bob   = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
    carol = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
)

func TestCreateGame(t *testing.T) {
    msgServer, context := setupMsgServer(t)
    createResponse, err := msgServer.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
    })
    require.Nil(t, err)
    require.EqualValues(t, types.MsgCreateGameResponse{
        IdValue: "", // TODO: update with a proper value when updated
    }, *createResponse)
}
```

You can test this with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

This convenient [`setupMsgServer`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/msg_server_test.go#L13-L16) function was created by Ignite CLI. To call this a _unit_ test is a slight misnomer because the `msgServer` created uses a real context and keeper, although with a [memory database](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/testutil/keeper/checkers.go#L24), not mocks.

## Interact via the CLI

First run the chain:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve
```

</CodeGroupItem>

</CodeGroup>

Time to see which new CLI command was created by Ignite CLI. In another shell:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers --help
```

</CodeGroupItem>

</CodeGroup>

Among other things, this informs you of the following:

```txt
...
Available Commands:
  create-game Broadcast message createGame
```

And also:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game --help
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
...
Usage:
  checkersd tx checkers create-game [black] [red] [flags]

Flags:
   -a, --account-number uint      The account number of the signing account (offline mode only)
   -b, --broadcast-mode string    Transaction broadcasting mode (sync|async|block) (default "sync")
       --dry-run                  Ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it
       --fee-account string       Fee account pays fees for the transaction instead of deducting from the signer
       --fees string              Fees to pay along with transaction; eg: 10uatom
       --from string              Name or address of private key with which to sign
       --gas string               Gas limit to set per-transaction; set to "auto" to calculate sufficient gas automatically (default 200000)
...
```

You kept the two accounts created by Ignite CLI.

Have `alice` start a game with `bob`.

<HighlightBox type="remember">

Instead of having to copy and paste the addresses each time you need them, you can store these as variables:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ export alice=$(checkersd keys show alice -a)
$ export bob=$(checkersd keys show bob -a)
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker exec checkers checkersd keys show alice -a)
$ export bob=$(docker exec checkers checkersd keys show bob -a)
```

Note how `docker` is called without `-it`, otherwise it would add a `\r` to the addresses.

</CodeGroupItem>

</CodeGroup>

You will have to redo this for every new shell, and for every use of the `--reset-once` flag.

</HighlightBox>

How much gas is needed? You can get an estimate by dry running the transaction using the `--dry-run` flag:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --dry-run
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice --dry-run
```

</CodeGroupItem>

</CodeGroup>

It appears the dry-run function is broken in this version. It if were not, it would print:

```txt
gas estimate: 40452
```

It is hard to assess how much gas that represents. In any case, keep gas on `auto`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice --gas auto
```

</CodeGroupItem>

</CodeGroup>

<ExpansionPanel title="The command prints a lot and prompts you for confirmation">

Note how it also prints the gas estimate:

```txt
gas estimate: 43032
{"body":{"messages":[{"@type":"/alice.checkers.checkers.MsgCreateGame","creator":"cosmos169mc8qqd6tlued00z23fs75tyecfcazpuwapc4","black":"cosmos169mc8qqd6tlued00z23fs75tyecfcazpuwapc4","red":"cosmos10mqyvj55hm4wunsd62wprwfv9ehcerkfghcjfl"}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[],"gas_limit":"43032","payer":"","granter":""}},"signatures":[]}

confirm transaction before signing and broadcasting [y/N]: y
code: 0
codespace: ""
data: 0A280A262F62396C61622E636865636B6572732E636865636B6572732E4D736743726561746547616D65
events:
- attributes:
  - index: true
    key: ZmVl
    value: ""
  type: tx
- attributes:
  - index: true
    key: YWNjX3NlcQ==
    value: Y29zbW9zMTY5bWM4cXFkNnRsdWVkMDB6MjNmczc1dHllY2ZjYXpwdXdhcGM0LzE=
  type: tx
- attributes:
  - index: true
    key: c2lnbmF0dXJl
    value: b1MwcWNrZEtPayt5UlNHdUtNbXZmdFViTjJZbkRTcER0RnNGZVNBais5WWQrQk9vYnRxdHh4Ylp6ZUlib29qd0VNR1BWS1l5Mkg1eHJ3VEZhQ0R5R3c9PQ==
  type: tx
- attributes:
  - index: true
    key: YWN0aW9u
    value: Y3JlYXRlX2dhbWU=
  type: message
gas_used: "41078"
gas_wanted: "43032"
height: "1598"
info: ""
logs:
- events:
  - attributes:
    - key: action
      value: create_game
    type: message
  log: ""
  msg_index: 0
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"create_game"}]}]}]'
timestamp: ""
tx: null
txhash: 576C303E3C43B409B0DEA1CBFF18B7F34F1E69492EE8A562751668117E42834B
```

If you are curious, the `.events.attributes` are encoded in Base64:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ echo YWN0aW9u | base64 -d
$ echo Y3JlYXRlX2dhbWU= | base64 -d
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "echo YWN0aW9u | base64 -d"
$ docker exec -it checkers bash -c "echo Y3JlYXRlX2dhbWU= | base64 -d"
```

</CodeGroupItem>

</CodeGroup>

Return respectively:

```txt
action%
create_game%
```

Which can be found again in `.raw_log`.

</ExpansionPanel>

You can query your chain to check whether the system info remains unchanged:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
SystemInfo:
  nextId: "1"
```

It remains unchanged.

Check whether any game was created:

<CodeGroup>

</CodeGroupItem>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers list-stored-game
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers list-stored-game
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
pagination:
  next_key: null
  total: "0"
storedGame: []
```

It appears that nothing changed. Ignite CLI created a message, you even signed and broadcast one. However you have not yet implemented what actions the chain should undertake when it receives this message.

When you are done with this exercise you can stop Ignite's `chain serve.`

## Next up

Ignite CLI separates concerns into different files. The most relevant file currently is `x/checkers/keeper/msg_server_create_game.go`, which is created once. The creation of the game is coded into this file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/msg_server_create_game.go#L13]
// TODO: Handling the message
```

You need to code in it the creation of the game properly. This is the object of the [next section](./create-handling.md).

<!-- Add GUI Elements -->
