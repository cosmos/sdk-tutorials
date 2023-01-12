---
title: "Extend the Checkers Game With a Leaderboard"
order: 8
description: Make your checkers game IBC-enabled
tags: 
  - concepts
  - ibc
  - dev-ops
---

# Extend the Checkers Game With a Leaderboard

<HighlightBox type="learning">

In this section, you will learn:

* How to make an existing chain IBC-enabled.
* How to extend your chains with additional modules.

</HighlightBox>

## What you will be building and why

The checkers blockchain you have built has the ability to create games, play them, forfeit them, and wager on them (potentially with cross-chain tokens). A further optimization would be to include a leaderboard. This could be executed locally on the checkers blockchain to rank the best players on the checkers blockchain.

But what if there is more than one checkers chain? Or better yet, other game chains that allow players to play a competitive game. Would it not be great to enable a standard to send the game data from the local game chain to an application-specific chain that keeps a global leaderboard? This is exactly what you will be building in the next few sections.

<HighlightBox type="remember">

Remember the [appchain thesis that is an integral part of the Cosmos philosophy](../../academy/3-ibc/1-what-is-ibc.md#internet-of-blockchains) - where every application has its own chain and can be optimized for the application-specific logic it executes. Then IBC can be used to interoperate between all the chains that have specialised functionality. This is the idea behind the prototype checkers and leaderboard chains you're building, enabling IBC packets to be sent between those chains to create cross-chain applications.

</HighlightBox>

## Adding a local leaderboard module to the checkers chain

Currently, your checkers game contains the checkers module but is not IBC-enabled. It is now time to extend your checkers game with a leaderboard by adding a new module to make it IBC-enabled.

Let’s dive right into it.

Go to your checkers folder and make sure that you are checked out on the [cosmjs-elements](https://github.com/cosmos/b9-checkers-academy-draft/tree/cosmjs-elements) tag.

In the checkers chain folder, you can scaffold a leaderboard module with Ignite:

```bash
$ ignite scaffold module leaderboard --ibc
```

In order to create and maintain a leaderboard, you need to store the player information. Scaffold a structure with:

```bash
$ ignite scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint dateUpdated:string --module leaderboard --no-message
```

Now you can use this structure to create the board itself:

```bash
$ ignite scaffold single board PlayerInfo:PlayerInfo --module leaderboard --no-message
```

You want the structures to be [nullable types](https://en.wikipedia.org/wiki/Nullable_type), so a few adjustments are needed - especially because you do not have a null value for an address.

You need to make the adjustments in the Protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the `Board`.

For example, for `proto/leaderboard/board.proto` try this:

```protobuf
syntax = "proto3";
package b9lab.checkers.leaderboard;

option go_package = "github.com/b9lab/checkers/x/leaderboard/types";
import "leaderboard/player_info.proto"; 
import "gogoproto/gogo.proto";

message Board {
  repeated PlayerInfo playerInfo = 1 [(gogoproto.nullable) = false]; 
  
}
```

<HighlightBox type="note">

You will also have to modify the `x/leaderboard/genesis.go`. In it, look for:

```golang
    // Set if defined
    if genState.Board != nil {
        k.SetBoard(ctx, *genState.Board)
    }
```

Simply change this to:

```golang
    k.SetBoard(ctx, genState.Board)
```

Next, in the `x/leaderboard/genesis_test.go`, look for:

```golang
    Board: &types.Board{
        PlayerInfo: new(types.PlayerInfo),
    },
```

Instead use:

```golang
    Board: types.Board{
     PlayerInfo: []types.PlayerInfo{},
   },
```

We gave the checkers' module access to the leaderboard's keeper. Therefore you will need to modify `testutils/keeper/checkers.go`. Locate:

```golang
    k := keeper.NewKeeper(
            bank,
            cdc,
            storeKey,
            memStoreKey,
```

Now add the leaderboard's keeper into it:

```golang
    leaderboardKeeper,_ := LeaderboardKeeper(t);
    k := keeper.NewKeeper(
        bank,
        *leaderboardKeeper,
        cdc,
        storeKey,
        memStoreKey,
```
</HighlightBox>

You want to store a _win_, a _loss_, or a _draw_ when a game ends. Thus, you should create some helper functions first. Create a `x/checkers/keeper/player_info_handler.go` file with the following code:

```go
package keeper

import (
    "fmt"

    rules "github.com/b9lab/checkers/x/checkers/rules"
    "github.com/b9lab/checkers/x/checkers/types"

    sdk "github.com/cosmos/cosmos-sdk/types"
)

func getWinnerAndLoserAddresses(storedGame *types.StoredGame) (winnerAddress sdk.AccAddress, loserAddress sdk.AccAddress) {
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        panic(types.ErrThereIsNoWinner.Error())
    }
    redAddress, err := storedGame.GetRedAddress()
    if err != nil {
        panic(err.Error())
    }
    blackAddress, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    if storedGame.Winner == rules.PieceStrings[rules.RED_PLAYER] {
        winnerAddress = redAddress
        loserAddress = blackAddress
    } else if storedGame.Winner == rules.PieceStrings[rules.BLACK_PLAYER] {
        winnerAddress = blackAddress
        loserAddress = redAddress
    } else {
        panic(fmt.Sprintf(types.ErrWinnerNotParseable.Error(), storedGame.Winner))
    }
    return winnerAddress, loserAddress
}

func (k *Keeper) MustRegisterPlayerWin(ctx sdk.Context, storedGame *types.StoredGame) {
    winnerAddress, loserAddress := getWinnerAndLoserAddresses(storedGame)
    k.board.MustAddWonGameResultToPlayer(ctx, winnerAddress)
    k.board.MustAddLostGameResultToPlayer(ctx, loserAddress)
}

func (k *Keeper) MustRegisterPlayerForfeit(ctx sdk.Context, storedGame *types.StoredGame) {
    winnerAddress, loserAddress := getWinnerAndLoserAddresses(storedGame)
    k.board.MustAddWonGameResultToPlayer(ctx, winnerAddress)
    k.board.MustAddForfeitedGameResultToPlayer(ctx, loserAddress)
}

```

The checkers module will need to access the leaderboard methods, like `k.board.MustAddWonGameResultToPlayer(...)`.

To achieve this, first, you need to write those functions. Create a `x/leaderboard/keeper/player_info_handler.go` file with the following code: 

```go
package keeper

import (
    "github.com/b9lab/checkers/x/leaderboard/types"
    sdk "github.com/cosmos/cosmos-sdk/types"
)

func mustAddDeltaGameResultToPlayer(
    k *Keeper,
    ctx sdk.Context,
    player sdk.AccAddress,
    wonDelta uint64,
    lostDelta uint64,
    forfeitedDelta uint64,
) (playerInfo types.PlayerInfo) {
    playerInfo, found := k.GetPlayerInfo(ctx, player.String())
    if !found {
        playerInfo = types.PlayerInfo{
            Index:          player.String(),
            WonCount:       0,
            LostCount:      0,
            ForfeitedCount: 0,
            DateUpdated:    ctx.BlockTime().UTC().Format(types.TimeLayout),
        }
    }
    playerInfo.WonCount += wonDelta
    playerInfo.LostCount += lostDelta
    playerInfo.ForfeitedCount += forfeitedDelta
    k.SetPlayerInfo(ctx, playerInfo)
    return playerInfo
}

func (k *Keeper) MustAddWonGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 1, 0, 0)
}

func (k *Keeper) MustAddLostGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 0, 1, 0)
}

func (k *Keeper) MustAddForfeitedGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 0, 0, 1)
}
```

For the code above to function, you need to define `TimeLayout` in `x/leaderboard/types/keys.go`. Add the following piece of code at the end of the file:

```go
const (
    TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
    LeaderboardWinnerLength = uint64(100)
)
```

Check your `x/checkers/types/errors.go` and make sure that it includes the following:

```go
    ErrWinnerNotParseable      = sdkerrors.Register(ModuleName, 1118, "winner is not parseable: %s")
    ErrThereIsNoWinner         = sdkerrors.Register(ModuleName, 1119, "there is no winner")
    ErrInvalidDateAdded        = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
    ErrCannotAddToLeaderboard  = sdkerrors.Register(ModuleName, 1121, "cannot add to leaderboard: %s")
```

Now it is time to allow the checkers module access to the leaderboard module. Look for `app.CheckersKeeper` in `app/app.go` and modify it to include `app.LeaderboardKeeper`:

```go
app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
        app.BankKeeper,
        app.LeaderboardKeeper,
        appCodec,
        keys[checkersmoduletypes.StoreKey],
        keys[checkersmoduletypes.MemStoreKey],
        app.GetSubspace(checkersmoduletypes.ModuleName),
    )
    checkersModule := checkersmodule.NewAppModule(appCodec, app.CheckersKeeper, app.AccountKeeper, app.BankKeeper)
```

In addition, you need to modify `x/checkers/keeper/keeper.go` and include the leaderboard keeper:

```go
import(
    ...

    leaderBoardKeeper "github.com/b9lab/checkers/x/leaderboard/keeper"
    )

...

type (
    Keeper struct {
        bank       types.BankEscrowKeeper
        board      leaderBoardKeeper.Keeper
        cdc        codec.BinaryCodec
        storeKey   sdk.StoreKey
        memKey     sdk.StoreKey
        paramstore paramtypes.Subspace
    }
)

...

func NewKeeper(
    bank types.BankEscrowKeeper,
    board leaderBoardKeeper.Keeper,
    cdc codec.BinaryCodec,
    storeKey,
    memKey sdk.StoreKey,
    ps paramtypes.Subspace,

) *Keeper {
    // set KeyTable if it has not already been set
    if !ps.HasKeyTable() {
        ps = ps.WithKeyTable(types.ParamKeyTable())
    }

    return &Keeper{
        bank:       bank,
        board:      board,
        cdc:        cdc,
        storeKey:   storeKey,
        memKey:     memKey,
        paramstore: ps,
    }
}

```

Now the checkers module can call the keeper of the leaderboard module, so add the call for a _win_ in `x/checkers/keeper/msg_server_play_move.go`:

```go

func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    ...

    lastBoard := game.String()
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        k.Keeper.SendToFifoTail(ctx, &storedGame, &systemInfo)
        storedGame.Board = lastBoard
    } else {
        k.Keeper.RemoveFromFifo(ctx, &storedGame, &systemInfo)
        storedGame.Board = ""
        k.Keeper.MustPayWinnings(ctx, &storedGame)

        // Here you can register a win
        k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    }

    ...
```

Now add the call for a _draw_ in `x/checkers/keeper/end_block_server_game.go`:

```go
func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    ...
    
    if deadline.Before(ctx.BlockTime()) {
    // Game is past deadline
    k.RemoveFromFifo(ctx, &storedGame, &systemInfo)
    lastBoard := storedGame.Board
    if storedGame.MoveCount <= 1 {
        // No point in keeping a game that was never really played
        k.RemoveStoredGame(ctx, gameIndex)
        if storedGame.MoveCount == 1 {
            k.MustRefundWager(ctx, &storedGame)
        }
    } else {
        storedGame.Winner, found = opponents[storedGame.Turn]
        if !found {
            panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Turn))
        }
        k.MustPayWinnings(ctx, &storedGame)

        // Here you can register a draw
        k.MustRegisterPlayerForfeit(ctx, &storedGame)

        storedGame.Board = ""
        k.SetStoredGame(ctx, storedGame)
    }
    
    ...
```

That will get the job done and add the player's _win_, _lose_, or _forfeit_ counts to the store.

It is time to sort the players and clip the leaderboard to the best 100 (`LeaderboardWinnerLength`) players. Scaffold a new transaction:

```bash
$ ignite scaffold message updateBoard --module leaderboard
```

Again, you can first create some helper functions in `x/leaderboard/keeper/board.go`:


```go
...

    func ParseDateAddedAsTime(dateAdded string) (dateAddedParsed time.Time, err error) {
        dateAddedParsed, errDateAdded := time.Parse(types.TimeLayout, dateAdded)
        return dateAddedParsed, sdkerrors.Wrapf(errDateAdded, types.ErrInvalidDateAdded.Error(), dateAdded)
    }

    func SortPlayerInfo(playerInfoList []types.PlayerInfo) {
        sort.SliceStable(playerInfoList[:], func(i, j int) bool {
            if playerInfoList[i].WonCount > playerInfoList[j].WonCount {
                return true
            }
            if playerInfoList[i].WonCount < playerInfoList[j].WonCount {
                return false
            }
            firstPlayerTime, _ := ParseDateAddedAsTime(playerInfoList[i].DateUpdated)
            secondPlayerTime,_ := ParseDateAddedAsTime(playerInfoList[j].DateUpdated)

            return firstPlayerTime.After(secondPlayerTime)
        })
    }

    func (k Keeper) updateBoard(ctx sdk.Context, playerInfoList []types.PlayerInfo) {
        SortPlayerInfo(playerInfoList)

        if types.LeaderboardWinnerLength < uint64(len(playerInfoList)) {
            playerInfoList = playerInfoList[:types.LeaderboardWinnerLength]
        }

        k.SetBoard(ctx, types.Board {
            PlayerInfo: playerInfoList,
        })
    }
```

If it cannot parse the date information, it will throw an error that you need to include in `x/leaderboard/types/errors.go`:

```go
    ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

Now you need to call `updateBoard` in `x/leaderboard/keeper/msg_server_update_board.go`:

```go
package keeper

import (
    "context"

    "github.com/b9lab/checkers/x/leaderboard/types"
    sdk "github.com/cosmos/cosmos-sdk/types"
)

func (k msgServer) UpdateBoard(goCtx context.Context, msg *types.MsgUpdateBoard) (*types.MsgUpdateBoardResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    playerInfoList := k.GetAllPlayerInfo(ctx)
    k.updateBoard(ctx, playerInfoList)

    return &types.MsgUpdateBoardResponse{}, nil
}
```

That is it! Now the checkers blockchain can keep track of player information, and create or update the leaderboard based on player information if requested via the CLI.

### Forwarding player information via IBC

It is time to look at how you can forward the player information via IBC.

<HighlightBox type="remember">

Remember, you created the module with the `--ibc` flag.

</HighlightBox>

You can scaffold an IBC transaction with:

```bash
$ ignite scaffold packet candidate PlayerInfo:PlayerInfo --module leaderboard
```

You do not want arbitrary player information, but instead, want to fetch player information from the store, so make a small adjustment to `x/leaderboard/client/cli/tx_candidate.go`. Look for the following lines and remove them:

```go
    argPlayerInfo := new(types.PlayerInfo)
    err = json.Unmarshal([]byte(args[2]), argPlayerInfo)
    if err != nil {
        return err
    }
```

You will also need to remove the import of `encoding/json` because it is not used anymore, and you should remove the parameter `argPlayerInfo` from the `types.NewMsgSendCandidate(...)` call.

The last step is to implement the logic to fetch and send player information in `x/leaderboard/keeper/msg_server_candidate.go`:

```go
package keeper

import (
    "errors"
    "context"
    ...
)

func (k msgServer) SendCandidate(goCtx context.Context, msg *types.MsgSendCandidate) (*types.MsgSendCandidateResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: logic before transmitting the packet

    // Construct the packet
    var packet types.CandidatePacketData

    allPlayerInfo := k.GetAllPlayerInfo(ctx)

    found_in_player_list:= false
    for i := range allPlayerInfo {
        if allPlayerInfo[i].Index == msg.Creator {
            packet.PlayerInfo = &allPlayerInfo[i];
            found_in_player_list = true
            break
        }
    }

    if !found_in_player_list {
        return nil, errors.New("player not found")
    }
...
}

```

You do not handle received packages, because this module is only meant for sending player information to a separate leaderboard chain, which you will create next.
