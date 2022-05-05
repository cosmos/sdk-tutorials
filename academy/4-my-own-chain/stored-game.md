---
title: Store Object - Make a Checkers Blockchain
order: 4
description: Create the object that stores a game
tag: deep-dive
---

# Store Object - Make a Checkers Blockchain

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding with the exercise:

* You understand the concepts of [accounts](../2-main-concepts/accounts.md), [Protobuf](../2-main-concepts/protobuf.md), and [multistore](../2-main-concepts/multistore-keepers.md).
* Have Go installed.
* The bare blockchain scaffold codebase with a single module named `checkers`. You can get there by following the [previous steps](./ignitecli.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/starport-start).

</HighlightBox>

In the [Ignite CLI introduction section](./ignitecli) you learned how to start a brand-new blockchain. Now it is time to dive deeper and explore how you can create a blockchain to play a decentralized game of checkers.

A good start to developing a checkers blockchain is to define the ruleset of the game. There are many versions of the rules. Choose [a very simple set of basic rules](https://www.ducksters.com/games/checkers_rules.php) to not get lost in the rules of checkers or the proper implementation of the board state.

Use [a ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) with the additional rule that the board is 8x8 and played on black cells. This code will not need adjustments. Copy this rules file into a `rules` folder inside your module. Change its package from `checkers` to `rules`. You can do this by command-line:

```sh
$ cd checkers
$ mkdir x/checkers/rules
$ curl https://raw.githubusercontent.com/batkinson/checkers-go/a09daeb1548dd4cc0145d87c8da3ed2ea33a62e3/checkers/checkers.go | sed 's/package checkers/package rules/' > x/checkers/rules/checkers.go
```

Do not focus on the GUI for the moment. You will only lay the foundation for an interface.

Now it is time to create the first object.

## The stored game object

Begin with the minimum game information needed to be kept in the storage:

* **Red player.** A string, the serialized address.
* **Black player.** A string, the serialized address.
* **Game proper.** A string, the game as it is serialized by the _rules_ file.
* **Player to play next.** A string.

### How to store

Knowing **what** to store, you now have to decide **how** to store a game. This is important if you want your blockchain application to accommodate multiple simultaneous games. The game is identified by a unique ID.

How should you generate the ID? You cannot let players choose it themselves as this could lead to transactions failing because of an ID clash. It is better to have a counter incrementing on each new game. This is possible because the code execution happens in a single thread. You cannot rely on a large random number like a universally unique identifier (UUID) because transactions have to be verifiable in the future.

You need to keep such a counter in storage between transactions. You can keep a unique object at a singular location instead of a single counter. You can easily add relevant elements to the object as needed in the future. Designate `idValue` to the counter.

You can rely on Ignite CLI's assistance:

* For the counter or rather the object that contains it, call `NextGame` and instruct Ignite CLI with `scaffold single`:

    ```sh
    $ ignite scaffold single nextGame idValue:uint --module checkers --no-message
    ```

    You need to add `--no-message`. If you omit it, Ignite CLI creates an `sdk.Msg` and an associated service, whose purpose is to overwrite your `NextGame` object. Your `NextGame.IdValue` has to be controlled/incremented by the application and not by a player sending a value of their own choosing. Ignite CLI still creates convenient getters.

* You need a map because you're storing games by ID. Instruct Ignite CLI with `scaffold map` using the `StoredGame` name:

    ```sh
    $ ignite scaffold map storedGame game turn red black --module checkers --no-message
    ```

    The `--no-message` again? You do not want the game objects to be created or overwritten with a simple `sdk.Msg`. The application instead creates and updates the objects when receiving properly crafted messages like [_create game_](./create-message.md) or [_play a move_](./play-game.md).

The Ignite CLI `scaffold` command creates several files as you can see [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/821f4592d78e5d689dcc349613c8efb11386f785) and [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/463968fa94a7b6117428bb342c721176086a8d22).

The command added new constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/keys.go#L28-L34]
const (
    NextGameKey = "NextGame-value-"
)

const (
    StoredGameKey = "StoredGame-value-"
)
```

These constants will be used as prefixes for the keys that can access objects' storage.

### Protobuf objects

Ignite CLI creates the Protobuf objects in the `proto` directory before compiling them. The `NextGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/next_game.proto#L8-L11]
message NextGame {
    string creator = 1;
    uint64 idValue = 2;
}
```

And the `StoredGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/stored_game.proto#L8-L15]
message StoredGame {
    string creator = 1;
    string index = 2;
    string game = 3;
    string turn = 4;
    string red = 5;
    string black = 6;
}
```

Both objects compile to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/next_game.pb.go#L26-L29]
type NextGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    IdValue uint64 `protobuf:"varint,2,opt,name=idValue,proto3" json:"idValue,omitempty"`
}
```
And:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/stored_game.pb.go#L26-L33]
type StoredGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    Index   string `protobuf:"bytes,2,opt,name=index,proto3" json:"index,omitempty"`
    Game    string `protobuf:"bytes,3,opt,name=game,proto3" json:"game,omitempty"`
    Turn    string `protobuf:"bytes,4,opt,name=turn,proto3" json:"turn,omitempty"`
    Red     string `protobuf:"bytes,5,opt,name=red,proto3" json:"red,omitempty"`
    Black   string `protobuf:"bytes,6,opt,name=black,proto3" json:"black,omitempty"`
}
```

These are not the only created Protobuf objects. The genesis state is also defined in Protobuf:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/genesis.proto#L11-L16]
import "checkers/stored_game.proto";
import "checkers/next_game.proto";

message GenesisState {
    repeated StoredGame storedGameList = 2;
    NextGame nextGame = 1;
}
```

Which is compiled to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/genesis.pb.go#L26-L30]
type GenesisState struct {
    StoredGameList []*StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

You can find query objects as part of the boilerplate objects created by Ignite CLI. `NextGame` might look out of place, but Ignite CLI creates the objects according to a model. This does not prevent you from making changes later if you decide these queries are not needed:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L51-L55]
message QueryGetNextGameRequest {}

message QueryGetNextGameResponse {
     NextGame NextGame = 1;
}
```

The query objects for `StoredGame` have more use to your checkers game and look like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L35-L50]
message QueryGetStoredGameRequest {
    string index = 1;
}

message QueryGetStoredGameResponse {
    StoredGame StoredGame = 1;
}

message QueryAllStoredGameRequest {
    cosmos.base.query.v1beta1.PageRequest pagination = 1;
}

message QueryAllStoredGameResponse {
    repeated StoredGame StoredGame = 1;
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}
```

### How Ignite CLI works

Ignite CLI puts the different Protobuf messages into different files depending on their use:

* **`query.proto`.** For the objects related to reading the state. Ignite CLI modifies this file as you add queries. This includes the objects to [query your stored elements](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L35-L55).
* **`tx.proto`.** For the objects that relate to updating the state. As you have only defined storage elements with `--no-message`, it is empty for now. The file will be modified as you add transaction-related elements like the message to [create a game](./create-message.md).
* **`genesis.proto`.** For the genesis. Ignite CLI modifies this file according to how your new storage elements evolve.
* **`next_game.proto` and `stored_game.proto`.** Separate files created once that remain untouched by Ignite CLI after their creation. You are free to modify them but be careful with the [numbering](https://developers.google.com/protocol-buffers/docs/overview#assigning_field_numbers).

Files updated by Ignite CLI include comments like:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L14]
// this line is used by starport scaffolding # 2
```

<HighlightBox type="tip">

Ignite CLI adds code right below the comments, which explains the odd numbering with the oldest lines appearing lower than recent ones. But make sure to keep these comments where they are so that Ignite CLI knows where to inject code in the future. You could add your code above or below the comments. You will be fine if you keep these comments where they are.

</HighlightBox>

Some files created by Ignite CLI can be updated, but you should not modify the Protobuf-compiled files [`*.pb.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/next_game.pb.go) and [`*.pb.gw.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/query.pb.gw.go) as they are recreated on every re-run of `ignite generate proto-go` or equivalent.

### Files to adjust

Ignite CLI creates files that you can and should update. For example, when it comes to the default genesis values:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/genesis.go#L16-L17]
const DefaultIndex uint64 = 1

func DefaultGenesis() *GenesisState {
    return &GenesisState{
        StoredGameList: []*StoredGame{},
        NextGame:       &NextGame{"", uint64(DefaultIndex)},
    }
}
```

You can choose to start with no games or insert a number of games to start with. You will need to choose the first ID of the first game in any case, which here is set at `1` by reusing the `DefaultIndex` value.

### Protobuf service interfaces

Beyond the created objects Ignite CLI also creates services that declare and define how to access the newly-created storage objects. Ignite CLI introduces empty service interfaces that can be filled as you add objects and messages when scaffolding a brand new module.

In your case, Ignite CLI added to `service Query` how to query for your objects:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L16-L30]
service Query {
    rpc StoredGame(QueryGetStoredGameRequest) returns (QueryGetStoredGameResponse) {
        option (google.api.http).get = "/alice/checkers/checkers/storedGame/{index}";
    }

    rpc StoredGameAll(QueryAllStoredGameRequest) returns (QueryAllStoredGameResponse) {
        option (google.api.http).get = "/alice/checkers/checkers/storedGame";
    }

    rpc NextGame(QueryGetNextGameRequest) returns (QueryGetNextGameResponse) {
        option (google.api.http).get = "/alice/checkers/checkers/nextGame";
    }
}
```

Ignite CLI separates concerns into different files in the compilation of a service. Some of which you should edit and some should be left untouched. The following was already taken care of by Ignite CLI for your checkers game:

* The [query parameters](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/query.pb.go#L33-L35), as well as [how to serialize](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/query.pb.go#L501) and make them conform to the right Protobuf [`RequestQuery`](https://github.com/tendermint/tendermint/blob/1c34d17/abci/types/types.pb.go#L636-L641) interface.
* The primary implementation of the gRPC service.
* The implementation of all the storage [setters and getters](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/keeper/grpc_query_stored_game.go) as extra functions in the keeper.
* The implementation of the storage getters in the keeper [as they come from the gRPC server](https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/keeper/grpc_query_stored_game.go).

## Helper functions

Your stored game stores are only strings. But you know that they represent `sdk.AccAddress` or even a game from the `rules` file. You are going to do operations on them. So how about adding helper functions to `StoredGame`?

1. Get the game `Creator`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game.go#L12-L15]
    func (storedGame *StoredGame) GetCreatorAddress() (creator sdk.AccAddress, err error) {
        creator, errCreator := sdk.AccAddressFromBech32(storedGame.Creator)
        return creator, sdkerrors.Wrapf(errCreator, ErrInvalidCreator.Error(), storedGame.Creator)
    }
    ```

    Plus the same for the [red](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game.go#L17-L20) and [black](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game.go#L22-L25) players.

2. Parse the game so that it can be played with. The `Turn` has to be set by hand:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game.go#L27-L37]
    func (storedGame *StoredGame) ParseGame() (game *rules.Game, err error) {
        game, errGame := rules.Parse(storedGame.Game)
        if errGame != nil {
            return nil, sdkerrors.Wrapf(errGame, ErrGameNotParseable.Error())
        }
        game.Turn = rules.StringPieces[storedGame.Turn].Player
        if game.Turn.Color == "" {
            return nil, sdkerrors.Wrapf(errors.New(fmt.Sprintf("Turn: %s", storedGame.Turn)), ErrGameNotParseable.Error())
        }
        return game, nil
    }
    ```

3. This is a good place to introduce your own errors:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/errors.go#L11-L14]
    var (
        ErrInvalidCreator   = sdkerrors.Register(ModuleName, 1100, "creator address is invalid: %s")
        ErrInvalidRed       = sdkerrors.Register(ModuleName, 1101, "red address is invalid: %s")
        ErrInvalidBlack     = sdkerrors.Register(ModuleName, 1102, "black address is invalid: %s")
        ErrGameNotParseable = sdkerrors.Register(ModuleName, 1103, "game cannot be parsed")
    )
    ```

## Unit tests

Now that you have added some code on top of what Ignite CLI created for you, you should add unit tests. You will not add code to test the code generated by Ignite CLI, as your project is not yet ready to _test the framework_. However, Ignite CLI added some unit tests of its own. Run those for the keeper:

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

### Your first unit test

A good start is to test that the default genesis is created as expected. Beside `x/checkers/types/genesis.go`, create a new `genesis_test.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/641440f/x/checkers/types/genesis_test.go#L9-L16]
func TestDefaultGenesisIsCorrect(t *testing.T) {
    require.EqualValues(t,
        &GenesisState{
            StoredGameList: []*StoredGame{},
            NextGame:       &NextGame{"", uint64(1)},
        },
        DefaultGenesis())
}
```

To run it, use `go test` with the package name:

```sh
$ go test github.com/alice/checkers/x/checkers/types
```

This should return something like:

```
ok      github.com/alice/checkers/x/checkers/types     0.814s
```

Alternatively, call it from the folder itself:

```sh
$ cd x/checkers/types/
$ go test
```

<HighlightBox type="info">

You want your tests to pass when everything is okay, but you also want them to fail when something is wrong. Make sure your new test fails by changing `uint64(1)` to `uint64(2)`. You should get the following:

```
--- FAIL: TestDefaultGenesisIsCorrect (0.00s)
    genesis_test.go:10:
                Error Trace:    genesis_test.go:10
                Error:          Not equal:
                                expected: &types.GenesisState{StoredGameList:[]*types.StoredGame{}, NextGame:(*types.NextGame)(0xc000506cf0)}
                                actual  : &types.GenesisState{StoredGameList:[]*types.StoredGame{}, NextGame:(*types.NextGame)(0xc000506d08)}

                                Diff:
                                --- Expected
                                +++ Actual
                                @@ -5,3 +5,3 @@
                                   Creator: (string) "",
                                -  IdValue: (uint64) 2
                                +  IdValue: (uint64) 1
                                  })
                Test:           TestDefaultGenesisIsCorrect
FAIL
exit status 1
```

This appears complex, but the significant aspect is this:

```sh
Diff:
--- Expected
+++ Actual
-  IdValue: (uint64) 2
+  IdValue: (uint64) 1
```

For _expected_ and _actual_ to make sense, you have to ensure that they are correctly placed in your call. When in doubt, go to the `require` function definition:

```go [https://github.com/stretchr/testify/blob/v1.7.0/require/require.go#L202]
func EqualValues(t TestingT, expected interface{}, actual interface{}, msgAndArgs ...interface{}) {...}
```

</HighlightBox>

### Debug your unit test

Your first unit test is a standard Go unit test. If you use an IDE like Visual Studio Code it is ready to assist run the test in debug mode. Next to the function name is a small green tick. If you hover below it, a faint red dot appears:

![Go test debug button in VSCode](/go_test_debug_button.png)

This red dot is a potential breakpoint. Add one on the `DefaultGenesis()` line. The dot is now bright and stays there:

![Go test breakpoint placed](/go_test_debug_breakpoint.png)

Right-click on the green tick, and choose <kbd>Debug Test</kbd>. If it asks you to install a package, accept. Eventually it stops at the breakpoint and displays the current variables and a panel for stepping actions:

![Go test stopped at breakpoint](/go_test_debug_stopped_at_breakpoint.png)

If you are struggling with a test, create separate variables in order to inspect them in debug. From there, follow your regular step-by-step debugging process. If you are not familiar with debugging, [this online tutorial](https://www.digitalocean.com/community/tutorials/debugging-go-code-with-visual-studio-code) will be helpful.

### More unit tests

With a simple yet successful unit test, you can add more consequential ones to test helper methods. Since you are going to repeat some actions, it is worth adding a reusable function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L12-L27]
const (
    alice = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
    bob   = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
    carol = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
)

func GetStoredGame1() *StoredGame {
    return &StoredGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
        Index:   "1",
        Game:    rules.New().String(),
        Turn:    "b",
    }
}
```

Now you can test the function to get the creator's address. One test for the happy path, and another for the error:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L29-L46]
func TestCanGetAddressCreator(t *testing.T) {
    aliceAddress, err1 := sdk.AccAddressFromBech32(alice)
    creator, err2 := GetStoredGame1().GetCreatorAddress()
    require.Equal(t, aliceAddress, creator)
    require.Nil(t, err1)
    require.Nil(t, err2)
}

func TestGetAddressWrongCreator(t *testing.T) {
    storedGame := GetStoredGame1()
    storedGame.Creator = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d4"
    creator, err := storedGame.GetCreatorAddress()
    require.Nil(t, creator)
    require.EqualError(t,
        err,
        "creator address is invalid: cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d4: decoding bech32 failed: checksum failed. Expected 3xn9d3, got 3xn9d4.")
    require.EqualError(t, storedGame.Validate(), err.Error())
}
```

You can do the same for [`Black`](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L48-L65) and [`Red`](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L67-L84).

Test that [you can parse a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L86-L90), even [if it has been tampered with](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L92-L98), except [if the tamper is wrong](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L100-L107) or [if the turn is wrongly saved](https://github.com/cosmos/b9-checkers-academy-draft/blob/3c2dd1c/x/checkers/types/full_game_test.go#L109-L116).

Interested in integration tests? Skip ahead to the [section](./game-wager.md) where you learn about them.

## Next up

Want to continue developing your checkers blockchain? In the [next section](./create-message.md) you will learn all about introducing an `sdk.Msg` to create a game.
