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
* Go is installed.
* You have the bare blockchain scaffold codebase with a single module named `checkers`. If not, follow the [previous steps](./starport.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/starport-start).

</HighlightBox>

In the [Starport introduction section](./starport) you learned how to start a brand-new blockchain. Now it is time to dive deeper and explore how you can create a blockchain to play a decentralized game of checkers.

A good start to developing a checkers blockchain is to define the ruleset of the game. There are many versions of the rules. Choose [a very simple set of basic rules](https://www.ducksters.com/games/checkers_rules.php) to avoid getting lost in the rules of checkers or the proper implementation of the board state.

Use [a ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) with the additional rule that the board is 8x8 and played on black cells. This code will not need adjustments. Copy this rules file into a `rules` folder inside your module. Change its package from `checkers` to `rules`. You can do this by command-line:

```sh
$ cd checkers
$ mkdir x/checkers/rules
$ curl https://raw.githubusercontent.com/batkinson/checkers-go/a09daeb1548dd4cc0145d87c8da3ed2ea33a62e3/checkers/checkers.go | sed 's/package checkers/package rules/' > x/checkers/rules/checkers.go
```

Do not focus on the GUI, this procedure lays the foundation for an interface.

Now it is time to create the first object.

## The stored game object

Begin with the minimum game information needed to be stored:

* **Red player.** A string, the serialized address.
* **Black player.** A string, the serialized address.
* **Game proper.** A string, the game as it is serialized by the _rules_ file.
* **Player to play next.** A string.

### How to store

Each game musst be identified by a unique ID. This is important if you want your blockchain application to accommodate multiple simultaneous games. 

How should you generate the ID? Players cannot choose it themselves, as this could lead to transactions failing because of an ID clash. You cannot rely on a large random number like a universally unique identifier (UUID), because transactions have to be verifiable in the future. It is better to have a counter incrementing on each new game. This is possible because the code execution happens in a single thread. 

The counter must be kept in storage between transactions. Instead of a single counter, you can keep a unique object at a singular location, and easily add relevant elements to the object as needed in the future. Designate `idValue` to the counter.

You can rely on Starport's assistance:

* Call the object that contains the counter `NextGame` and instruct Starport with `scaffold single`:

    ```sh
    $ starport scaffold single nextGame idValue:uint --module checkers --no-message
    ```

    You must add `--no-message`. If you omit it, Starport creates an `sdk.Msg` and an associated service, whose purpose is to overwrite your `NextGame` object. Your `NextGame.IdValue` must be controlled/incremented by the application and not by a player sending a value of their own choosing. Starport still creates convenient getters.

* You need a map because you're storing games by ID. Instruct Starport with `scaffold map` using the `StoredGame` name:

    ```sh
    $ starport scaffold map storedGame game turn red black --module checkers --no-message
    ```

    Here `--no-message` prevents game objects from being created or overwritten with a simple `sdk.Msg`. The application instead creates and updates the objects when receiving properly crafted messages like [_create game_](./create-message.md) or [_play a move_](./play-game.md).

The Starport `scaffold` command creates several files, as you can see [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/821f4592d78e5d689dcc349613c8efb11386f785) and [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/463968fa94a7b6117428bb342c721176086a8d22).

The command added new constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/keys.go#L28-L34]
const (
    NextGameKey = "NextGame-value-"
)

const (
    StoredGameKey = "StoredGame-value-"
)
```

These constants are used as prefixes for the keys that can access the storage location of objects.

### Protobuf objects

Starport creates the Protobuf objects in the `proto` directory before compiling them. The `NextGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/next_game.proto#L6-L9]
message NextGame {
    string creator = 1;
    uint64 idValue = 2;
}
```

The `StoredGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/stored_game.proto#L6-L13]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/next_game.pb.go#L25-L28]
type NextGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    IdValue uint64 `protobuf:"varint,2,opt,name=idValue,proto3" json:"idValue,omitempty"`
}
```
They also compile to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/stored_game.pb.go#L25-L32]
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

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/genesis.proto#L11-L16]
import "checkers/stored_game.proto";
import "checkers/next_game.proto";

message GenesisState {
    repeated StoredGame storedGameList = 2;
    NextGame nextGame = 1;
}
```

This is compiled to:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/genesis.pb.go#L26-L30]
type GenesisState struct {
    StoredGameList []*StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

You can find query objects as part of the boilerplate objects created by Starport. Starport creates the objects according to a model, but this does not prevent you from making changes later if you decide these queries are not needed:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/query.proto#L51-L55]
message QueryGetNextGameRequest {}

message QueryGetNextGameResponse {
     NextGame NextGame = 1;
}
```

The query objects for `StoredGame` are more useful for your checkers game, and look like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/query.proto#L35-L50]
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

### How Starport works

Starport puts the different Protobuf messages into different files depending on their use:

* **`query.proto`** - for objects related to reading the state. Starport modifies this file as you add queries. This includes objects to [query your stored elements](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/query.proto#L35-L55).
* **`tx.proto`** - for objects that relate to updating the state. As you have only defined storage elements with `--no-message`, it is empty for now. The file will be modified as you add transaction-related elements like the message to [create a game](./create-message.md).
* **`genesis.proto`** - for the genesis. Starport modifies this file according to how your new storage elements evolve.
* **`next_game.proto` and `stored_game.proto`** - separate files created once, that remain untouched by Starport. You are free to modify them but be careful with [numbering](https://developers.google.com/protocol-buffers/docs/overview#assigning_field_numbers).

Files updated by Starport include comments like:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/query.proto#L14]
// this line is used by starport scaffolding # 2
```

<HighlightBox type="tip">

Starport adds code right below the comments, which explains why the oldest lines appear lower than recent ones. Make sure to keep these comments where they are so that Starport knows where to inject code in the future. You could add your code above or below the comments.

</HighlightBox>

Some files created by Starport can be updated, but you should not modify the Protobuf-compiled files [`*.pb.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/next_game.pb.go) and [`*.pb.gw.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/query.pb.gw.go) as they are recreated on every re-run of `starport generate proto-go` or equivalent.

### Files to adjust

Starport creates files that you can and should update. For example, the default genesis values:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/genesis.go#L16-L17]
func DefaultGenesis() *GenesisState {
    return &GenesisState{
        StoredGameList: []*StoredGame{},
        NextGame:       &NextGame{"", uint64(0)},
    }
}
```

You can choose to start with no games or insert a number of games to start with. In either case, you must choose the first ID of the first game, which here is set at `0`.

### Protobuf service interfaces

In addition to created objects, Starport also creates services that declare and define how to access the newly-created storage objects. Starport introduces empty service interfaces that can be filled as you add objects and messages when scaffolding a brand new module.

In this case, Starport added to `service Query` how to query for your objects:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/proto/checkers/query.proto#L16-L30]
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

Starport separates concerns into different files in the compilation of a service. Some should be edited and some should not. The following were prepared by Starport for your checkers game:

* The [query parameters](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/query.pb.go#L33-L35), as well as [how to serialize](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/types/query.pb.go#L501) and make them conform to the right Protobuf [`RequestQuery`](https://github.com/tendermint/tendermint/blob/1c34d17/abci/types/types.pb.go#L636-L641) interface.
* The primary implementation of the gRPC service.
* The implementation of all the storage [setters and getters](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/keeper/grpc_query_stored_game.go) as extra functions in the keeper.
* The implementation of the storage getters in the keeper [as they come from the gRPC server](https://github.com/cosmos/b9-checkers-academy-draft/blob/9c9b90e/x/checkers/keeper/grpc_query_stored_game.go).

## Helper functions

Your stored game stores are only strings, but they represent `sdk.AccAddress` or even a game from the `rules` file. Therefor, you add helper functions to `StoredGame` to do operations on them.

1. Get the game `Creator`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d7272dd/x/checkers/types/full_game.go#L9-L12]
    func (storedGame *StoredGame) GetCreatorAddress() (creator sdk.AccAddress, err error) {
        creator, errCreator := sdk.AccAddressFromBech32(storedGame.Creator)
        return creator, sdkerrors.Wrapf(errCreator, ErrInvalidCreator.Error(), storedGame.Creator)
    }
    ```

    Do the same for the [red](https://github.com/cosmos/b9-checkers-academy-draft/blob/d7272dd/x/checkers/types/full_game.go#L14-L17) and [black](https://github.com/cosmos/b9-checkers-academy-draft/blob/d7272dd/x/checkers/types/full_game.go#L19-L22) players.

2. Parse the game so that it can be played with. The `Turn` has to be set by hand:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d7272dd/x/checkers/types/full_game.go#L24-L33]
    func (storedGame *StoredGame) ParseGame() (game *rules.Game, err error) {
        game, errGame := rules.Parse(storedGame.Game)
        if err != nil {
            return game, sdkerrors.Wrapf(errGame, ErrGameNotParseable.Error())
        }
        game.Turn = rules.Player{
            Color: storedGame.Turn,
        }
        return game, nil
    }
    ```

3. Introduce your own errors:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d7272dd/x/checkers/types/errors.go#L11-L14]
    var (
        ErrInvalidCreator   = sdkerrors.Register(ModuleName, 1100, "creator address is invalid: %s")
        ErrInvalidRed       = sdkerrors.Register(ModuleName, 1101, "red address is invalid: %s")
        ErrInvalidBlack     = sdkerrors.Register(ModuleName, 1102, "black address is invalid: %s")
        ErrGameNotParseable = sdkerrors.Register(ModuleName, 1103, "game cannot be parsed")
    )
    ```

## Next up

Want to continue developing your checkers blockchain? In the [next section](./create-message.md) you will learn all about introducing an `sdk.Msg` to create a game.
