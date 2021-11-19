---
title: Make a Checkers Blockchain
order: 4
description: You create the object that stores a game.
---

# Make a Checkers Blockchain

With Starport, you learned how to jump-start a brand new blockchain. Let's dive deeper and see how you would go about creating one that lets people play the game of checkers in a decentralized fashion.

_The_ game of checkers? Ok, there are many versions of the rules. Let's choose [those](https://www.ducksters.com/games/checkers_rules.php). Also, the object of the deep dive is to learn about Starport and the Cosmos SDK, not to get lost in the proper implementation of the board state or of the rules of checkers. So let's use [this ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go), with the additional rule that the board is 8x8 and played on black cells. It so happens that this code will not need adjustments. Also, you are not going to be overly concerned with a marketable GUI since, again, that would be a separate project in itself. Of course, you still need to concern yourself with creating the groundwork for a GUI to be possible in the first place.

Here goes. If you did not already do it in the previous section, create your brand new blockchain with a `checkers` module:

```sh
$ starport scaffold chain github.com/alice/checkers
```
When it is all done, copy the [rules file](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) into a `rules` folder inside your module, and change its package from `checkers` to `rules`. Let's do it by command-line, because why not:

```sh
$ cd checkers
$ mkdir x/checkers/rules
$ curl https://raw.githubusercontent.com/batkinson/checkers-go/a09daeb1548dd4cc0145d87c8da3ed2ea33a62e3/checkers/checkers.go | sed 's/package checkers/package rules/' > x/checkers/rules/checkers.go
```
With this done, it is time to move on to the first object to create.

# The Stored Game Object

Let's start with what is the minimum game information you need to keep in storage. No need to burden yourself with all bells and whistles at the start.

* The red player: a string, the serialized address.
* The black player: a string, the serialized address.
* The game proper: a string, the game as it is serialized by the _rules_ file.
* Which player is to play next: a string.

## How To Store It

After having decided **what** to store, you have to decide **how** to store a game. You want your blockchain application to accommodate multiple simultaneous games on an equal footing. This calls for each game to be identified by an id, and to be retrievable by the same id.

How do you create such an id? You cannot let players choose it as that could lead to transactions failing for the silly reason that the proposed id is already taken. It is better to have a counter incrementing on each new game. This is possible because the code execution happens in a single thread. Moreover, you cannot rely on a large random number, like a UUID, because transactions have to be verifiable in the future.

You also need to keep this counter in storage in between transactions. Instead of a single counter, you can instead keep a unique object at a singular location. This way you can easily add to it when the need arises. Let's call `idValue` the counter.

Starport to the rescue:

* For the counter, or rather the object that contains it, let's call it `NextGame` and instruct Starport with `scaffold single`:
    ```sh
    $ starport scaffold single nextGame idValue:uint --module checkers --no-message
    ```
    You need to add `--no-message` so as to not expose the counter to the outside world via a simple CRUD interface. After all, you want to keep control of how this counter increments.
* For games saved by id, it calls this a map, and, if you choose the `StoredGame` name, you instruct Starport with `scaffold map`:
    ```sh
    $ starport scaffold map storedGame game turn red black --module checkers --no-message
    ```

Why the `--no-message`? Well, you don't want these objects to be created or overwritten with a simple message. Instead they are to be created and updated by the application when it receives properly crafted messages like _create game_ or _play a move_.

This has created a certain number of files as can be seen [here](https://github.com/cosmos/b9-checkers-academy-draft/commit/821f4592d78e5d689dcc349613c8efb11386f785) and [there](https://github.com/cosmos/b9-checkers-academy-draft/commit/463968fa94a7b6117428bb342c721176086a8d22).

For starters, it has added new keys:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/keys.go#L28-L34]
const (
    NextGameKey = "NextGame-value-"
)

const (
    StoredGameKey = "StoredGame-value-"
)
```
Which will be used to prefix the keys at which the objects are stored.

## Protobuf Objects

As you know, Starport creates the Protobuf objects first in the `proto` directory before compiling them. Therefore you have the `NextGame` object:

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
Both of them predictably compiled into:

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
These are not the only Protobuf objects created. The genesis state is also defined in Protobuf, therefore you have:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/genesis.proto#L11-L16]
import "checkers/stored_game.proto";
import "checkers/next_game.proto";

message GenesisState {
    repeated StoredGame storedGameList = 2;
    NextGame nextGame = 1;
}
```
Which is compiled into:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/genesis.pb.go#L26-L30]
type GenesisState struct {
    StoredGameList []*StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```
As part of the boilerplate objects created by Starport there are objects to query and receive these new meaty objects. In the case of `NextGame`, it looks a bit out of place, but keep in mind that Starport creates them according to a versatile model, which does not prevent you from making changes down the road:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L51-L55]
message QueryGetNextGameRequest {}

message QueryGetNextGameResponse {
     NextGame NextGame = 1;
}
```
In the case of the query objects for `StoredGame`, they look convenient:

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

## Starport's Modus Operandi

Notice how Starport has filed the different Protobuf messages into different files depending on their eventual use:

* `query.proto` for the objects related to asking queries, i.e. reading the state. Plus a service, see below. This file will be modified by Starport as you add queries.
* `tx.proto` for the objects that relate to updating the state. For now it is empty, and with good reason since you have only defined storage elements with `--no-message` for now. This file will be modified too as you add transaction-related elements.
* `genesis.proto` for the genesis as it evolves with your new storage elements. Starport will modify this file too.
* `next_game.proto` and `stored_game.proto`, separate files that were created once and that Starport will not touch again. You are free to modify them and be careful with the numbering.

As a note on the files Starport updates down the road, observe how those files have comments like:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/proto/checkers/query.proto#L14]
// this line is used by starport scaffolding # 2
```
Starport adds code right below them so keep these comments in place and you shall be fine. You can add your own code above or below, though.

On the other hand, you should not modify the Protobuf-compiled files, named `*.pb.go` and `*.pb.gw.go`, as they are recreated on every re-run of Starport. There are other files, also created by Starport, that you can update.

## Files To Adjust

Starport created files that you can and should update as you see fit. For instance, the default genesis values:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d2a72b4ca9064a7e3e5014ba204ed01a4fe81468/x/checkers/types/genesis.go#L16-L17]
func DefaultGenesis() *GenesisState {
    return &GenesisState{
        StoredGameList: []*StoredGame{},
        NextGame:       &NextGame{"", uint64(0)},
    }
}
```
Here, you can choose to start with no games, or, for some obscure reason, insert a number of them. More to the point, you ought also to choose the first id of the first game. Here, it will be `0`.

## Protobuf Service Interfaces

Beyond these created objects, Starport also created services that declare and define how to access the newly created storage objects. More precisely, when Starport created your module, it introduced empty service interfaces that it can fill in as you add objects and messages. In particular, it added to `service Query` how to query for your objects:

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
As for the compilation of such a service, Starport takes a somewhat circuitous route, whose purpose is to separate concerns into different files, some you should not edit, and others you can:

* Serialization of the query parameters, and their conforming to the right Protobuf `Message` interface.
* The primary implementation of the gRPC service.
* The implementation of all the storage setters and getters as extra functions in the keeper.
* The implementation, in the keeper, of the storage getters as they come from the gRPC server.

## Conclusion

At this point, Starport got you covered, and you did not have to do much. Sure you had to confirm the correct genesis value of `NextGame.IdValue`.
