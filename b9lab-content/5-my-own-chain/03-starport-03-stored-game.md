---
title: Make a Checkers Blockchain
order: 4
description: Create the object that stores a game
tag: deep-dive
---

# Make a Checkers Blockchain

<HighlightBox type="prereq">

In the [Starport introduction section](./03-starport.md) you learned how to jump-start a brand new blockchain. Now it is time to dive deeper and explore how you can create a blockchain to play a decentralized game of checkers.

</HighlightBox>

A good start to developing a checkers blockchain is to define the ruleset of the game. There are many versions of the rules. Let's choose [a very simple set of basic rules](https://www.ducksters.com/games/checkers_rules.php) to not get lost in the rules of checkers or the proper implementation of the board state.

Use [a ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go), with the additional rule that the board is 8x8 and played on black cells. This code will not need adjustments.

For the moment, do not focus on the GUI. You will only lay the foundation for an interface.

If you did not already do it in the [previous section](./03-starport.md), create your brand new blockchain with a `checkers` module:

```sh
$ starport scaffold chain github.com/alice/checkers
```

Then copy the [rules file](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) into a `rules` folder inside your module. Change its package from `checkers` to `rules`. You can do this by command-line:

```sh
$ cd checkers
$ mkdir x/checkers/rules
$ curl https://raw.githubusercontent.com/batkinson/checkers-go/a09daeb1548dd4cc0145d87c8da3ed2ea33a62e3/checkers/checkers.go | sed 's/package checkers/package rules/' > x/checkers/rules/checkers.go
```

Now it is time to create the first object.

## The stored game object

Begin with the minimum game information needed to be kept in the storage:

* The red player: a string, the serialized address.
* The black player: a string, the serialized address.
* The game proper: a string, the game as it is serialized by the _rules_ file.
* The player to play next: a string.

### How to store

Knowing **what** to store, you now have to decide **how** to store a game. This is important if you want your blockchain application to accommodate multiple simultaneous games. The game is identified by a unique ID.

How to generate this ID? You cannot let players choose it themselves as this could lead to transactions failing because of an ID clash. It is better to have a counter incrementing on each new game. This is possible because the code execution happens in a single thread. Moreover, you cannot rely on a large random number like a universally unique identifier (UUID), because transactions have to be verifiable in the future.

You will need to keep such a counter in storage between transactions. Instead of a single counter, you can keep a unique object at a singular location. Then you can easily add to the counter as needed. Designate `idValue` the counter.

You can rely on Starport's assistance:

* For the counter or rather the object that contains it, call it `NextGame` and instruct Starport with `scaffold single`:

    ```sh
    $ starport scaffold single nextGame idValue:uint --module checkers --no-message
    ```

    You need to add `--no-message` to not expose the counter to the outside world via a simple CRUD interface. You want to keep control of how this counter increments.
* Because you're storing games by ID, you'll need a map. Using the `StoredGame` name, instruct Starport with `scaffold map`:

    ```sh
    $ starport scaffold map storedGame game turn red black --module checkers --no-message
    ```

Why the `--no-message`? You do not want the objects to be created or overwritten with a simple message. Instead, the application creates and updates the objects when receiving properly crafted messages like _create game_ or _play a move_.

The Starport scaffold creates several files, as you can see [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/821f4592d78e5d689dcc349613c8efb11386f785) and [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/463968fa94a7b6117428bb342c721176086a8d22).

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

Starport creates the Protobuf objects in the `proto` directory before compiling them. The `NextGame` object looks like this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/next_game.proto#L8-L11]
message NextGame {
    string creator = 1;
    uint64 idValue = 2;
}
```

And the `StoredGame` object:

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

As part of the boilerplate objects created by Starport, you can find query objects. `NextGame` might look out of place, but keep in mind Starport creates the objects according to a model. This does not prevent you from making changes later if you decide these queries are not needed:

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

### Starport's modus operandi

Starport puts the different Protobuf messages into different files depending on their use:

* `query.proto`: for the objects related to reading the state. Starport modifies this file as you add queries.
* `tx.proto`: for the objects that relate to updating the state. As you have only defined storage elements with `--no-message`, it is empty for now. The file will be modified as you add transaction-related elements.
* `genesis.proto`: for the genesis. Starport modifies this file according to how your new storage elements evolve.
* `next_game.proto` and `stored_game.proto`: separate files created once that remain untouched by Starport after their creation. You are free to modify them but be careful with the [numbering](https://developers.google.com/protocol-buffers/docs/overview#assigning_field_numbers).

Files updated by Starport include comments like:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L14]
// this line is used by starport scaffolding # 2
```

Starport adds code right below the comments but make sure to keep these comments where they are so that Starport knows where to inject code in the future. You could add your code above or below the comments. You will be fine if you keep these comments where they are.

Some files created by Starport can be updated, but you should not modify the Protobuf-compiled files `*.pb.go` and `*.pb.gw.go` as they are recreated on every re-run of Starport.

### Files to adjust

Starport creates files that you can and should update. For example, when it comes to the default genesis values:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/genesis.go#L16-L17]
func DefaultGenesis() *GenesisState {
    return &GenesisState{
        StoredGameList: []*StoredGame{},
        NextGame:       &NextGame{"", uint64(0)},
    }
}
```

You can choose to start with no games or, if desired, insert a number of games to start with. In any case, you will need to choose the first ID of the first game, which we decide to be `0`.

### Protobuf service interfaces

Beyond the created objects Starport also creates services that declare and define how to access the newly-created storage objects. When Starport creates your module, it introduces empty service interfaces that can be filled as you add objects and messages.

Starport added to `service Query` how to query for your objects:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L16-L30]
service Query {
    rpc StoredGame(QueryGetStoredGameRequest) returns (QueryGetStoredGameResponse) {
        option (google.api.http).get = "/xavierlepretre/checkers/checkers/storedGame/{index}";
    }

    rpc StoredGameAll(QueryAllStoredGameRequest) returns (QueryAllStoredGameResponse) {
        option (google.api.http).get = "/xavierlepretre/checkers/checkers/storedGame";
    }

    rpc NextGame(QueryGetNextGameRequest) returns (QueryGetNextGameResponse) {
        option (google.api.http).get = "/xavierlepretre/checkers/checkers/nextGame";
    }
}
```

In the compilation of a service Starport separates concerns into different files. Some of which you should edit, and some should be left untouched. For your checkers game, you'll need to customize:

* The query parameters to serialize them and make them conform to the right Protobuf `Message` interface.
* The primary implementation of the gRPC service.
* The implementation of all the storage setters and getters as extra functions in the keeper.
* The implementation of the storage getters in the keeper as they come from the gRPC server.

## Next up

You'll be implementing these customizations as you move along in this chapter. For now, Starport covered most of the boilerplate and custom work that was needed. Want to continue developing your checkers blockchain? Go ahead to the [next section](./03-starport-04-creat-message.md) to learn all about creating a game message.
