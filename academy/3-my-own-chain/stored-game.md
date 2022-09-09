---
title: "Store Object - Make a Checkers Blockchain"
order: 6
description: Create the object that stores a game
tags: 
  - guided-coding
  - cosmos-sdk
---

# Store Object - Make a Checkers Blockchain

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding with the exercise:

* You understand the concepts of [accounts](../2-main-concepts/accounts.md), [Protobuf](../2-main-concepts/protobuf.md), and [multistore](../2-main-concepts/multistore-keepers.md).
* Go is installed.
* You have the bare blockchain scaffold codebase with a single module named `checkers`. If not, follow the [previous steps](./ignitecli.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start).
* You have the `checkers_i` Docker image if you work with Docker. If not, follow the [previous steps](./ignitecli.md).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will handle:

* The Stored Game object
* Protobuf objects
* Query.proto
* Protobuf service interfaces
* Your first unit test
* Interactions via the command-line

</HighlightBox>

In the [Ignite CLI introduction section](./ignitecli.md) you learned how to start a completely new blockchain. Now it is time to dive deeper and explore how you can create a blockchain to play a decentralized game of checkers.

## Some initial thoughts

As you are face-to-face with the proverbial blank page: where do you start?

A good place to start with is thinking about the objects you keep in storage. **A game**, obviously... but what does any game have to keep in storage?

Questions to ask that could influence your design include, but are not limited to:

* What is the lifecycle of a game?
* How are participants selected to be in a game?
* What fields make it possible to play across a span of time and transactions?
* What fields make it possible to differentiate between different games?
* How do you ensure safety against malice, sabotage, or even simple errors?
* What limitations does your design **intentionally** impose on participants?
* What limitations does your design **unintentionally** impose on participants?

After thinking about what goes into each individual game, you should consider the demands of the wider system. In general terms, before you think about the commands that achieve what you seek, ask:

* How do you lay games in storage?
* How do you save and retrieve games?

The goal here is not to finalize every conceivable game feature immediately. For instance, handling wagers or leaderboards can be left for another time. But there should be a basic game design good enough to accommodate future improvements.

## Code needs

**Do not** dive headlong into coding the rules of checkers in Go - examples will already exist which you can put to use. Your job is to make a blockchain that just happens to enable the game of checkers.

With that in mind:

* What Ignite CLI commands will get you a long way when it comes to implementation?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your modest additions?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

Run the commands, make the adjustments, and run some tests regarding game storage. Do not go into deeper issues like messages and transactions yet.

### Defining the rule set

A good start to developing a checkers blockchain is to define the rule set of the game. There are many versions of the rules. Choose [a very simple set of basic rules](https://www.ducksters.com/games/checkers_rules.php) to avoid getting lost in the rules of checkers or the proper implementation of the board state.

Use [a ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) with the additional rule that the board is 8x8, is played on black cells, and black plays first. This code will not need adjustments. Copy this rules file into a `rules` folder inside your module. Change its package from `checkers` to `rules`. You can do this by command-line:

```sh
$ mkdir x/checkers/rules
$ curl https://raw.githubusercontent.com/batkinson/checkers-go/a09daeb1548dd4cc0145d87c8da3ed2ea33a62e3/checkers/checkers.go | sed 's/package checkers/package rules/' > x/checkers/rules/checkers.go
```

Do not focus on the GUI, this procedure lays the foundation for an interface.

Now it is time to create the first object.

## The stored game object

Begin with the minimum game information needed to be stored:

* **Black player.** A string, the serialized address.
* **Red player.** A string, the serialized address.
* **Board proper.** A string, the board as it is serialized by the _rules_ file.
* **Player to play next.** A string, specifying whose _turn_ it is.

<HighlightBox type="remember">

When you save strings, it makes it easier to understand what comes straight out of storage, but at the expense of storage space. As an advanced consideration, you could store the same information in binary.

</HighlightBox>

### How to store

After you know **what** to store, you have to decide **how** to store a game. This is important if you want your blockchain application to accommodate multiple simultaneous games. The game is identified by a unique ID.

How should you generate the ID? If you let players choose it themselves, this could lead to transactions failing because of an ID clash. You cannot rely on a large random number like a universally unique identifier (UUID), because transactions have to be verifiable in the future. Verifiable means that nodes verifying the block need to arrive at the same conclusion. However, the `new UUID()` command is not deterministic. In this context, it is better to have a counter incrementing on each new game. This is possible because the code execution happens in a single thread.

The counter must be kept in storage between transactions. Instead of a single counter in storage, you can keep the counter in a unique object at a singular storage location, and easily add relevant elements to the object as needed in the future. Name the counter as `nextId` and its container as `SystemInfo`.

As for the game type, you can name it as `StoredGame`.

You can rely on Ignite CLI's assistance for both the counter and the game:

* For the counter and its container, you instruct Ignite CLI with `scaffold single`:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold single systemInfo nextId:uint --module checkers --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold single systemInfo nextId:uint --module checkers --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>

    In this command:

    * `nextId` is explicitly made to be a `uint`. If you left it to Ignite's default, it would be a `string`.
    * You must add `--no-message`. If you omit it, Ignite CLI creates an `sdk.Msg` and an associated service whose purpose is to overwrite your `SystemInfo` object. However, your `SystemInfo.NextId` must be controlled/incremented by the application and not by a player sending a value of their own choosing. Ignite CLI still creates convenient getters.

* For the game type, because you are storing games by ID, you need a map. Instruct Ignite CLI with `scaffold map` using the `StoredGame` name:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold map storedGame board turn black red --index index --module checkers --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold map storedGame board turn black red --index index --module checkers --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>

    In this command:

    * `board`, `turn`, `black` and `red` are by default strings, so there is no need to be explicit with for instance `board:string`.
    * `index` is the id field picked, and anyway is the default name when scaffolding a map. `id` cannot be chosen when scaffolding with Ignite.
    * `--no-message` prevents game objects from being created or overwritten with a simple `sdk.Msg`. The application instead creates and updates the objects when receiving properly crafted messages like [_create game_](./create-message.md) or [_play a move_](./play-game.md).

The Ignite CLI `scaffold` command creates several files, as you can see [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/d5a93bf) and [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/4249ce1).

### Looking around

The command added new constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/keys.go#L24-L26]
const (
    SystemInfoKey = "SystemInfo-value-"
)
```

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/key_stored_game.go#L7-L10]
const (
    StoredGameKeyPrefix = "StoredGame/value/"
)
```

These constants are used as prefixes for the keys that can access the storage location of objects.

In the case of games, the store model lets you _narrow_ the search. For instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/keeper/stored_game.go#L24]
store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.StoredGameKeyPrefix))
```

This gets the store to access any game if you have its index:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/keeper/stored_game.go#L26-L28]
b := store.Get(types.StoredGameKey(
    index,
))
```

### Protobuf objects

Ignite CLI creates the Protobuf objects in the `proto` directory before compiling them. The `SystemInfo` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/system_info.proto#L6-L8]
message SystemInfo {
    uint64 nextId = 1;
}
```

The `StoredGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/stored_game.proto#L6-L12]
message StoredGame {
    string index = 1; 
    string board = 2; 
    string turn = 3; 
    string black = 4; 
    string red = 5; 
}
```

Both objects compile to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/system_info.pb.go#L25-L27]
type SystemInfo struct {
    NextId uint64 `protobuf:"varint,1,opt,name=nextId,proto3" json:"nextId,omitempty"`
}
```

And to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/stored_game.pb.go#L25-L31]
type StoredGame struct {
    Index string `protobuf:"bytes,1,opt,name=index,proto3" json:"index,omitempty"`
    Board string `protobuf:"bytes,2,opt,name=board,proto3" json:"board,omitempty"`
    Turn  string `protobuf:"bytes,3,opt,name=turn,proto3" json:"turn,omitempty"`
    Black string `protobuf:"bytes,4,opt,name=black,proto3" json:"black,omitempty"`
    Red   string `protobuf:"bytes,5,opt,name=red,proto3" json:"red,omitempty"`
}
```

<HighlightBox type="best-practice">

At this point, note that `SystemInfo` and `StoredGame` do not have a field named _creator_. That is because they were created with the `--no-message` flag. If you had omitted this flag, the message creator would always be saved into the object's creator. Like so:

```protobuf
message SystemInfo {
    string creator = 1; // If you had omitted --no-message
    uint64 nextId = 2;
}
```

</HighlightBox>

These are not the only created Protobuf objects. The genesis state is also defined in Protobuf:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/4249ce1/proto/checkers/genesis.proto#L15-L16]
import "checkers/system_info.proto";
import "checkers/stored_game.proto";

message GenesisState {
    ...
    SystemInfo systemInfo = 2;
    repeated StoredGame storedGameList = 3 [(gogoproto.nullable) = false];
}
```

This is compiled to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis.pb.go#L26-L30]
type GenesisState struct {
    Params         Params       `protobuf:"bytes,1,opt,name=params,proto3" json:"params"`
    SystemInfo     *SystemInfo  `protobuf:"bytes,2,opt,name=systemInfo,proto3" json:"systemInfo,omitempty"`
    StoredGameList []StoredGame `protobuf:"bytes,3,rep,name=storedGameList,proto3" json:"storedGameList"`
}
```

You can find query objects as part of the boilerplate objects created by Ignite CLI. Ignite CLI creates the objects according to a model, but this does not prevent you from making changes later if you decide these queries are not needed:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto#L46-L50]
message QueryGetSystemInfoRequest {}

message QueryGetSystemInfoResponse {
	SystemInfo SystemInfo = 1 [(gogoproto.nullable) = false];
}
```

The query objects for `StoredGame` are more useful for your checkers game, and look like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto#L51-L67]
message QueryGetStoredGameRequest {
    string index = 1;
}

message QueryGetStoredGameResponse {
    StoredGame StoredGame = 1 [(gogoproto.nullable) = false];
}

message QueryAllStoredGameRequest {
    cosmos.base.query.v1beta1.PageRequest pagination = 1;
}

message QueryAllStoredGameResponse {
    repeated StoredGame StoredGame = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}
```

### How Ignite CLI works

Ignite CLI puts the different Protobuf messages into different files depending on their use:

* [**`query.proto`**](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto) - for objects related to reading the state. Ignite CLI modifies this file whenever you instruct it to add queries. This includes objects to [query your stored elements](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto#L46-L67).
* [**`tx.proto`**](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/tx.proto) - for objects that relate to updating the state. As you have only defined storage elements with `--no-message`, it is empty for now. The file will be modified as you add transaction-related elements like the message to [create a game](./create-message.md).
* [**`genesis.proto`**](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/genesis.proto) - for the genesis. Ignite CLI modifies this file according to how your new storage elements evolve.
* [**`system_info.proto`**](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/system_info.proto) and [**`stored_game.proto`**](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/stored_game.proto) - separate files created once, that will remain untouched by Ignite CLI. You are free to modify them but be careful with [field numbering](https://developers.google.com/protocol-buffers/docs/overview#assigning_field_numbers).

Files updated by Ignite CLI include comments like:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto#L34]
// this line is used by starport scaffolding # 2
```

<HighlightBox type="tip">

Ignite CLI adds code right below the comments, which explains why at times the oldest lines appear lower than recent ones. Make sure to keep these comments where they are so that Ignite CLI knows where to inject code in the future. You could add your code above or below the comments.

</HighlightBox>

Some files created by Ignite CLI can be updated, but you should not modify the Protobuf-compiled files [`*.pb.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/system_info.pb.go) and [`*.pb.gw.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/query.pb.gw.go) as they are recreated on every re-run of `ignite generate proto-go` or equivalent.

### Files to adjust

Ignite CLI creates files that you can and should update. For example, the default genesis values start as:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis.go#L13]
return &GenesisState{
    SystemInfo:     nil,
    ...
}
```

This is not correct. Your chain needs to start with an initial system info. This raises the point that the genesis' `SystemInfo` should in fact [never be null](https://pkg.go.dev/github.com/gogo/protobuf/gogoproto). You can enforce that in `genesis.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/proto/checkers/genesis.proto#L15]
message GenesisState {
    ...
    SystemInfo systemInfo = 2 [(gogoproto.nullable) = false];
    ...
}
```

After compilation, this `nullable = false` flag changes the `SystemInfo` type in genesis from a pointer to a straight value. Make sure you recompile:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite generate proto-go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

Then set a default value for `SystemInfo`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/genesis.go#L13-L15]
const DefaultIndex uint64 = 1

func DefaultGenesis() *GenesisState {
    return &GenesisState{
        SystemInfo: SystemInfo{
            NextId: uint64(DefaultIndex),
        },
        StoredGameList: []StoredGame{},
        ...
    }
}
```

You can choose to start with no games or insert a number of games to start with. In either case, you must choose the first ID of the first future created game, which here is set at `1` by reusing the `DefaultIndex` value.

Do not forget to fix the [other compilation errors](https://github.com/cosmos/b9-checkers-academy-draft/commit/58f4adc) due to the change of type.

As you can see, it is possible to adjust what Ignite CLI created.

### Protobuf service interfaces

In addition to created objects, Ignite CLI also creates services that declare and define how to access the newly-created storage objects. Ignite CLI introduces empty service interfaces that can be filled as you add objects and messages when scaffolding a brand new module.

In this case, Ignite CLI added to `service Query` how to query for your objects:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/proto/checkers/query.proto#L15-L35]
service Query {
    rpc Params(QueryParamsRequest) returns (QueryParamsResponse) {
        option (google.api.http).get = "/alice/checkers/checkers/params";
    }

	rpc SystemInfo(QueryGetSystemInfoRequest) returns (QueryGetSystemInfoResponse) {
		option (google.api.http).get = "/alice/checkers/checkers/system_info";
	}

	rpc StoredGame(QueryGetStoredGameRequest) returns (QueryGetStoredGameResponse) {
		option (google.api.http).get = "/alice/checkers/checkers/stored_game/{index}";
	}

	rpc StoredGameAll(QueryAllStoredGameRequest) returns (QueryAllStoredGameResponse) {
		option (google.api.http).get = "/alice/checkers/checkers/stored_game";
	}
}
```

Ignite CLI separates concerns into different files in the compilation of a service. Some should be edited and some should not. The following were prepared by Ignite CLI for your checkers game:

* The [query parameters](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/query.pb.go#L196-L198), as well as [how to serialize](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/query.pb.go#L741) and make them conform to the right Protobuf [`RequestQuery`](https://github.com/tendermint/tendermint/blob/331860c/abci/types/types.pb.go#L750-L755) interface.
* The primary implementation of the gRPC service.
* The implementation of all the storage [setters and getters](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/keeper/grpc_query_stored_game.go) as extra functions in the keeper.
* The implementation of the storage getters in the keeper [as they come from the gRPC server](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/keeper/grpc_query_stored_game.go).

## Additional helper functions

Your stored game's `black` and `red` fields are only strings, but they represent `sdk.AccAddress` or even a game from the `rules` file. Therefore, add helper functions to `StoredGame` to facilitate operations on them. Create a new file `x/checkers/types/full_game.go`.

1. Get the game's black player:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game.go#L12-L15]
    func (storedGame StoredGame) GetBlackAddress() (black sdk.AccAddress, err error) {
        black, errBlack := sdk.AccAddressFromBech32(storedGame.Black)
        return black, sdkerrors.Wrapf(errBlack, ErrInvalidBlack.Error(), storedGame.Black)
    }
    ```

    Note how it introduces a new error `ErrInvalidBlack`, which you define shortly. Do the same for the [red](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game.go#L17-L20) player.

2. Parse the game so that it can be played. The `Turn` has to be set by hand:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game.go#L22-L32]
    func (storedGame StoredGame) ParseGame() (game *rules.Game, err error) {
        board, errBoard := rules.Parse(storedGame.Board)
        if errBoard != nil {
            return nil, sdkerrors.Wrapf(errBoard, ErrGameNotParseable.Error())
        }
        board.Turn = rules.StringPieces[storedGame.Turn].Player
        if board.Turn.Color == "" {
            return nil, sdkerrors.Wrapf(errors.New(fmt.Sprintf("Turn: %s", storedGame.Turn)), ErrGameNotParseable.Error())
        }
        return board, nil
    }
    ```

3. Add a function that checks a game's validity:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game.go#L34-L45]
    func (storedGame StoredGame) Validate() (err error) {
        _, err = storedGame.GetBlackAddress()
        if err != nil {
            return err
        }
        _, err = storedGame.GetRedAddress()
        if err != nil {
            return err
        }
        _, err = storedGame.ParseGame()
        return err
    }
    ```

4. Introduce your own errors:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/errors.go#L11-L14]
    var (
        ErrInvalidBlack     = sdkerrors.Register(ModuleName, 1100, "black address is invalid: %s")
        ErrInvalidRed       = sdkerrors.Register(ModuleName, 1101, "red address is invalid: %s")
        ErrGameNotParseable = sdkerrors.Register(ModuleName, 1102, "game cannot be parsed")
    )
    ```

## Unit tests

Now that you have added some code on top of what Ignite CLI created for you, you should add unit tests. You will not add code to test the code generated by Ignite CLI, as your project is not yet ready to _test the framework_. However, Ignite CLI added some unit tests of its own. Run those for the keeper:

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

It should pass and return something like:

```txt
ok      github.com/alice/checkers/x/checkers/keeper     0.083s
```

### Your first unit test

A good start is to test that the default genesis is created as expected. Ignite already created a unit test for the genesis in [`x/checkers/types/genesis_test.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go). It runs simple validity tests on different genesis examples.

Take your time to understand how it works, as this testing pattern is reused elsewhere. [Three cases](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L16-L53) are tested: [case 1](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L16-L20), [case 2](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L21-L39), and [case 3](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L40-L53). In each case, there is a [made-up genesis object](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L13), an [expected validity result](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L14), and [some text](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L12) to help the reader make sense of it. This [array of cases](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L11) is then run through the [test proper](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/types/genesis_test.go#L56-L63).

The unit test you add is more modest. Your test checks that the starting id on a default genesis is `1`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/genesis_test.go#L67-L74]
func TestDefaultGenesisState_ExpectedInitialNextId(t *testing.T) {
    require.EqualValues(t,
        &types.GenesisState{
            StoredGameList: []types.StoredGame{},
            SystemInfo:     types.SystemInfo{uint64(1)},
        },
        types.DefaultGenesis())
}
```

To run it, use `go test` with the package name:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/types
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/types
```

</CodeGroupItem>

</CodeGroup>

This should return something like:

```txt
ok      github.com/alice/checkers/x/checkers/types     0.814s
```

Alternatively, call it from the folder itself:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd x/checkers/types/ && go test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers/x/checkers/types checkers_i go test
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="best-practice">

You want your tests to pass when everything is okay, but you also want them to fail when something is wrong. Make sure your new test fails by temporarily changing `uint64(1)` to `uint64(2)`. You should get the following:

```txt
--- FAIL: TestDefaultGenesisState_ExpectedInitialNextId (0.00s)
    genesis_test.go:68: 
        Error Trace:    genesis_test.go:68
        Error:          Not equal: 
                expected: &types.GenesisState{Params:types.Params{}, SystemInfo:types.SystemInfo{NextId:0x2}, StoredGameList:[]types.StoredGame{}}
                actual  : &types.GenesisState{Params:types.Params{}, SystemInfo:types.SystemInfo{NextId:0x1}, StoredGameList:[]types.StoredGame{}}
                            
                Diff:
                --- Expected
                +++ Actual
                @@ -4,3 +4,3 @@
                    SystemInfo: (types.SystemInfo) {
                -  NextId: (uint64) 2
                +  NextId: (uint64) 1
                    },
        Test:           TestDefaultGenesisState_ExpectedInitialNextId
FAIL
FAIL    github.com/alice/checkers/x/checkers/types      0.187s
FAIL
```

This appears complex, but the significant aspect is this:

```txt
Diff:
--- Expected
+++ Actual
-  NextId: (uint64) 2
+  NextId: (uint64) 1
```

For _expected_ and _actual_ to make sense, you have to ensure that they are correctly placed in your call. When in doubt, go to the `require` function definition:

```go [https://github.com/stretchr/testify/blob/v1.7.0/require/require.go#L202]
func EqualValues(t TestingT, expected interface{}, actual interface{}, msgAndArgs ...interface{}) {...}
```

</HighlightBox>

### Debug your unit test

Your first unit test is a standard Go unit test. If you use an IDE like Visual Studio Code and have Go installed locally, it is ready to assist you with running the test in debug mode. Next to the function name is a small green tick or arrow. If you hover below it, a faint red dot appears:

![Go test debug button in VSCode](/academy/4-my-own-chain/images/go_test_debug_button.png)

This red dot is a potential breakpoint. Add one on the `types.DefaultGenesis()` line. The dot is now bright and stays there:

![Go test breakpoint placed](/academy/4-my-own-chain/images/go_test_debug_breakpoint.png)

Right-click on the green tick, and choose <kbd>Debug Test</kbd>. If it asks you to install a package, accept. Eventually it stops at the breakpoint and displays the current variables and a panel for stepping actions:

![Go test stopped at breakpoint](/academy/4-my-own-chain/images/go_test_debug_stopped_at_breakpoint.png)

If you are struggling with a test, create separate variables in order to inspect them in debug. From there, follow your regular step-by-step debugging process. If you are not familiar with debugging, [this online tutorial](https://www.digitalocean.com/community/tutorials/debugging-go-code-with-visual-studio-code) will be helpful.

### More unit tests

With a simple yet successful unit test, you can add more consequential ones to test your helper methods. Create a new file `x/checkers/types/full_game_test.go` and declare it in [`package types_test`](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L1). Since you are going to repeat some actions, it is worth adding a reusable function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L13-L27]
const (
    alice = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
    bob   = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
    carol = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
)

func GetStoredGame1() *types.StoredGame {
    return types.StoredGame{
        Black: alice,
        Red:   bob,
        Index: "1",
        Board: rules.New().String(),
        Turn:  "b",
    }
}
```

Now you can test the function to get the black player's address. One test for the happy path, and another for the error:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L29-L46]
func TestCanGetAddressBlack(t *testing.T) {
    aliceAddress, err1 := sdk.AccAddressFromBech32(alice)
    black, err2 := GetStoredGame1().GetBlackAddress()
    require.Equal(t, aliceAddress, black)
    require.Nil(t, err2)
    require.Nil(t, err1)
}

func TestGetAddressWrongBlack(t *testing.T) {
    storedGame := GetStoredGame1()
    storedGame.Black = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d4" // Bad last digit
    black, err := storedGame.GetBlackAddress()
    require.Nil(t, black)
    require.EqualError(t,
        err,
        "black address is invalid: cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d4: decoding bech32 failed: invalid checksum (expected 3xn9d3 got 3xn9d4)")
    require.EqualError(t, storedGame.Validate(), err.Error())
}
```

You can do the same for [`Red`](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L48-L65).

Test that [you can parse a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L67-L71), even [if it has been tampered with](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L73-L79), except [if the tamper is wrong](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L81-L88) or [if the turn is wrongly saved](https://github.com/cosmos/b9-checkers-academy-draft/blob/full-game-object/x/checkers/types/full_game_test.go#L90-L97).

Interested in integration tests? Skip ahead to the [section](./game-wager.md) where you learn about them.

## Interact via the CLI

Ignite CLI created a set of files for you. It is time to see whether you can already interact with your new checkers blockchain.

1. Start the chain in its shell:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite chain serve --reset-once
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve --reset-once
    ```

    <HighlightBox type="note">
    
    The throwaway container is started with the name `checkers`, so that you can connect to it for the next commands.

    </HighlightBox>

    </CodeGroupItem>

    </CodeGroup>

    This ends and holds with:

    ```txt
    ...
    🌍 Tendermint node: http://0.0.0.0:26657
    🌍 Blockchain API: http://0.0.0.0:1317
    🌍 Token faucet: http://0.0.0.0:4500
    ```

2. Check the values saved in `SystemInfo`. Look at the relevant `client/cli` file, which Ignite CLI created to find out what command is relevant. Here it is [`query_system_info.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/client/cli/query_system_info.go#L14). You can also ask the CLI:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ checkersd query checkers --help
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker exec -it checkers checkersd query checkers --help
    ```

    Note how it connects to the newly created container named `checkers`.

    </CodeGroupItem>

    </CodeGroup>

    Which returns something like:

    ```txt
    Available Commands:
    ...
    show-system-info shows systemInfo
    ```

    Therefore, you call it:

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

    ```yaml
    SystemInfo:
      nextId: "1"
    ```

    This is as expected. No games have been created yet, so the game counter is still at `1`.

3. The `--output` flag allows you to get your results in a JSON format, which might be useful if you would like to use a script to parse the information. When you use the `--help` flag, you see which flags are available for a specific command:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ checkersd query checkers show-system-info --help
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker exec -it checkers checkersd query checkers show-system-info --help
    ```

    </CodeGroupItem>

    </CodeGroup>

    Among the output, you see:

    ```txt
    ...
    -o, --output string   Output format (text|json) (default "text")
    ```

    Now try again a bit differently:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ checkersd query checkers show-system-info --output json
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker exec -it checkers checkersd query checkers show-system-info --output json
    ```

    </CodeGroupItem>

    </CodeGroup>

    This should print:

    ```json
    {"SystemInfo":{"nextId":"1"}}
    ```

3. You can similarly confirm there are no [stored games](https://github.com/cosmos/b9-checkers-academy-draft/blob/stored-game/x/checkers/client/cli/query_stored_game.go#L14):

    <CodeGroup>

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

    This should print:

    ```yaml
    pagination:
      next_key: null
      total: "0"
    storedGame: []
    ```

Remember how you wrote `--no-message`? That was to not create messages or transactions, which would directly update your checkers storage. Soft-confirm there are no commands available:

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

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to begin creating an original blockchain application, in this case a checkers game, identifying and prioritizing the basic core game features to build a foundation for future improvements.
* How to define a checkers rule set by searching for and obtaining an existing implementation, rather than needlessly duplicating complex coding work.
* The minimum game information it is necessary to store, and how to store it making use of Ignite CLI.
* The Protobuf objects created by Ignite CLI, which locates objects in different files depending on their use and updates them to include informative comments indicating where code has been added.
* The files created by Ignite CLI which you can and should update, for example by setting the default genesis values.
* The Protobuf services and service interfaces created by Ignite CLI that you will fill with objects and messages when scaffolding a new module.
* How to add helper functions which you can add to perform operations on the strings that represent your stored games, such as getting the game creator and players and introducing your own errors.
* How to add, run, and debug unit tests to check the functionality of your code.
* How to use Ignite CLI to confirm that you can interact with your new checkers blockchain.

</HighlightBox>

<!--## Next up

Want to continue developing your checkers blockchain? In the [next section](./create-message.md), you will learn all about introducing an `sdk.Msg` to create a game.-->
