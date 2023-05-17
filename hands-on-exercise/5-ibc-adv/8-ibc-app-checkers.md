---
title: "Extend the Checkers Game With a Leaderboard"
order: 8
description: Make your checkers game IBC-enabled
tags: 
  - concepts
  - guided-coding
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

The checkers blockchain you have built has the ability to create games, play them, forfeit them, and wager on them (potentially with cross-chain tokens). A further optimization would be to include a leaderboard. This could be executed locally on the checkers blockchain to rank the best players on the checkers blockchain. You can see an example of this in the [migration sections](../4-run-in-prod/2-migration-info.md).

But what if there is more than one checkers chain? Or better yet, other game chains that allow players to play competitive games. Would it not be great to enable a standard to send the game data from the local game chain to an application-specific chain that keeps a global leaderboard? This is exactly what you will be building in the next few sections.

<HighlightBox type="remember">

Remember the [appchain thesis that is an integral part of the Cosmos philosophy](../../academy/3-ibc/1-what-is-ibc.md#internet-of-blockchains) - where every application has its own chain and can be optimized for the application-specific logic it executes. Then IBC can be used to interoperate between all the chains that have specialized functionality. This is the idea behind the prototype checkers and leaderboard chains you're building, enabling IBC packets to be sent between those chains to create cross-chain applications.

</HighlightBox>

## Adding a local leaderboard module to the checkers chain

Currently, your checkers game contains the checkers module but is not IBC-enabled. It is now time to extend your checkers game with a leaderboard by adding a new module to make it IBC-enabled.

Let’s dive right into it.

Go to your checkers folder and make sure that you are checked out on the [cosmjs-elements](https://github.com/cosmos/b9-checkers-academy-draft/tree/cosmjs-elements) branch.

In the checkers chain folder, you can scaffold a leaderboard module with Ignite:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold module leaderboard --ibc
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    ignitehq/cli:0.22.1 \
    scaffold module leaderboard --ibc
```

</CodeGroupItem>

</CodeGroup>

In order to create and maintain a leaderboard, you need to store the player information. Scaffold a structure with:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold map playerInfo \
    wonCount:uint lostCount:uint forfeitedCount:uint \
    dateUpdated:string \
    --module leaderboard \
    --no-message
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/leaderboard \
    -w /leaderboard \
    ignitehq/cli:0.22.1 \
    scaffold map playerInfo \
    wonCount:uint lostCount:uint forfeitedCount:uint \
    dateUpdated:string \
    --module leaderboard \
    --no-message
```

</CodeGroupItem>

</CodeGroup>

Now you can use this structure to create the board itself:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold single board \
    PlayerInfo:PlayerInfo \
    --module leaderboard \
    --no-message
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/leaderboard \
    -w /leaderboard \
    ignitehq/cli:0.22.1 \
    scaffold single board \
    PlayerInfo:PlayerInfo \
    --module leaderboard \
    --no-message
```

</CodeGroupItem>

</CodeGroup>

The structures created by Ignite are [nullable types](https://en.wikipedia.org/wiki/Nullable_type) by default, but you do not want that. So a few adjustments are needed - especially because you do not have a null value for an address.

You need to make the adjustments in the Protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the [`Board`](https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/proto/leaderboard/genesis.proto#L17).

For example, for `proto/leaderboard/board.proto` try this:

```diff-protobuf [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/proto/leaderboard/board.proto#L9]
    syntax = "proto3";
    package b9lab.checkers.leaderboard;

    option go_package = "github.com/b9lab/checkers/x/leaderboard/types";
    import "leaderboard/player_info.proto"; 
+  import "gogoproto/gogo.proto";

    message Board {
-      PlayerInfo playerInfo = 1; 
+      repeated PlayerInfo playerInfo = 1 [(gogoproto.nullable) = false]; 
    }
```

<HighlightBox type="note">

After re-compilation, you will also have to modify the `x/leaderboard/genesis.go`. In it, look for:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/genesis.go#L17]
-   if genState.Board != nil {
-       k.SetBoard(ctx, *genState.Board)
-   }
+   k.SetBoard(ctx, genState.Board)
```

And:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/genesis.go#L44]
    if found {
-      genesis.Board = &board
+      genesis.Board = board
    }

```

Next, in the `x/leaderboard/genesis_test.go`, look for:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/genesis_test.go#L25-L27]
-  Board: &types.Board{
-      PlayerInfo: new(types.PlayerInfo),
+  Board: types.Board{
+      PlayerInfo: []types.PlayerInfo{},
    },
```

Next, in `x/leaderboard/types/genesis.go`, look for:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/genesis.go#L16-L18]
-   Board:          nil,
+   Board: Board{
+       PlayerInfo: []PlayerInfo{},
+   },
```

Now, in its associated test:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/genesis_test.go#L33-L35]
-   Board: &types.Board{
-       PlayerInfo: new(types.PlayerInfo),
-   },
+   Board: types.Board{
+       PlayerInfo: []types.PlayerInfo{},
+   },
```

Lastly in:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/client/cli/query_board_test.go#L24-L30]
-   board := &types.Board{}
+   board := types.Board{}
    ...
-   return network.New(t, cfg), *state.Board
+   return network.New(t, cfg), state.Board
```

</HighlightBox>

Continue preparing your new leaderboard module.

The checkers module is the authority when it comes to who won and who lost; the leaderboard module is the authority when it comes to how to tally scores and rank players. Therefore, the leaderboard module will only expose to the checkers module functions to inform on wins and losses, like `MustAddWonGameResultToPlayer(...)`.

To achieve this, first you need to write those functions. Create a `x/leaderboard/keeper/player_info_handler.go` file with the following code: 

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/keeper/player_info_handler.go]
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

func (k Keeper) MustAddWonGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(&k, ctx, player, 1, 0, 0)
}

func (k Keeper) MustAddLostGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(&k, ctx, player, 0, 1, 0)
}

func (k Keeper) MustAddForfeitedGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(&k, ctx, player, 0, 0, 1)
}
```

For the code above to function, you need to define `TimeLayout` in `x/leaderboard/types/keys.go`. Add the following piece of code at the end of the file:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/keys.go#L39-L42]
const (
    TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
    LeaderboardWinnerLength = uint64(100)
)
```

Now it is time to allow the checkers module access to the leaderboard module. This is very similar to what you did when giving access to the bank keeper when handling wager tokens.

Declare the leaderboard functions that the checkers needs:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/types/expected_keepers.go#L26-L30]
import (
    leaderboardTypes "github.com/b9lab/checkers/x/leaderboard/types"
)

type CheckersLeaderboardKeeper interface {
    MustAddWonGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) leaderboardTypes.PlayerInfo
    MustAddLostGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) leaderboardTypes.PlayerInfo
    MustAddForfeitedGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) leaderboardTypes.PlayerInfo
}
```

Add this keeper interface to checkers, modify `x/checkers/keeper/keeper.go`, and include the leaderboard keeper:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/keeper.go#L19]
   type (
       Keeper struct {
           bank       types.BankEscrowKeeper
+         board      types.CheckersLeaderboardKeeper
           cdc        codec.BinaryCodec
           storeKey   sdk.StoreKey
           memKey     sdk.StoreKey
           paramstore paramtypes.Subspace
       }
   )

   ...

   func NewKeeper(
       bank types.BankEscrowKeeper,
+     board types.CheckersLeaderboardKeeper,
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
+         board:      board,
           cdc:        cdc,
           storeKey:   storeKey,
           memKey:     memKey,
           paramstore: ps,
       }
   }
```

Make sure the app builds it correctly. Look for `app.CheckersKeeper` in `app/app.go` and modify it to include `app.LeaderboardKeeper`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/app/app.go#L440]
   app.CheckersKeeper = *checkersmodulekeeper.NewKeeper(
       app.BankKeeper,
+     app.LeaderboardKeeper,
       appCodec,
       ...
   )
```

You want to store a _win_ plus either a _loss_ or a _forfeit_ when a game ends. Therefore, you should create some helper functions in checkers that call the leaderboard module. Create a `x/checkers/keeper/player_info_handler.go` file with the following code:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/player_info_handler.go]
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

Do not forget to add the new errors in `x/checkers/types/errors.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/types/errors.go#L29-L32]
ErrWinnerNotParseable      = sdkerrors.Register(ModuleName, 1118, "winner is not parseable: %s")
ErrThereIsNoWinner         = sdkerrors.Register(ModuleName, 1119, "there is no winner")
ErrInvalidDateAdded        = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
ErrCannotAddToLeaderboard  = sdkerrors.Register(ModuleName, 1121, "cannot add to leaderboard: %s")
```

With the helper functions ready, you can call them where needed. Add the call for a _win_ in `x/checkers/keeper/msg_server_play_move.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/msg_server_play_move.go#LL80]
   func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
       ...
       lastBoard := game.String()
       if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
           k.Keeper.SendToFifoTail(ctx, &storedGame, &systemInfo)
           storedGame.Board = lastBoard
       } else {
           k.Keeper.RemoveFromFifo(ctx, &storedGame, &systemInfo)
           storedGame.Board = ""
           k.Keeper.MustPayWinnings(ctx, &storedGame)

+         // Here you can register a win
+         k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
       }
       ...
```

Add the call for a _forfeit_ in `x/checkers/keeper/end_block_server_game.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/end_block_server_game.go#L57]
   func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
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

+         // Here you can register a forfeit
+         k.MustRegisterPlayerForfeit(ctx, &storedGame)

           storedGame.Board = ""
           k.SetStoredGame(ctx, storedGame)
       }
       ...
```

That will get the job done, and add the player's _win_, _loss_, or _forfeit_ counts to the store.

If you did the [migration part](../4-run-in-prod/2-migration-info.md) of this hands-on exercise, you may notice that, here, although the player info is updated, the leaderboard is not. This is deliberate in order to show a different workflow.

Here, the leaderboard is updated on-demand by adding the signers of a message as candidates to the leaderboard. Scaffold a new message:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold message updateBoard --module leaderboard
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/leaderboard \
    -w /leaderboard \
    ignitehq/cli:0.22.1 \
    scaffold message updateBoard --module leaderboard
```

</CodeGroupItem>

</CodeGroup>

Again, you can first create some helper functions in `x/leaderboard/types/board.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/board.go#L40-L70]
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

func UpdatePlayerInfoList(winners []PlayerInfo, candidates []PlayerInfo) (updated []PlayerInfo) {
    found := false
    for _, candidate := range candidates {
        for winnerIndex, winner := range winners {
            if winner.Index == candidate.Index {
                winners[winnerIndex] = candidate
                found = true
                break
            }
        }
        if !found {
            updated = append(winners, candidate)
        } else {
            updated = winners
        }
    }
    SortPlayerInfo(updated)
    if LeaderboardWinnerLength < uint64(len(updated)) {
        updated = updated[:LeaderboardWinnerLength]
    }
    return updated
}
```

The function that sorts players is rather inefficient, as it parses dates a lot. To optimize this part, you would have to introduce a new type with the date already parsed. See the [migration section](../4-run-in-prod/2-migration-info.md) for an example.

If it cannot parse the date information, it will return an error that you need to declare in `x/leaderboard/types/errors.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/errors.go#L14]
ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

Now you need to call what you created in `x/leaderboard/keeper/msg_server_update_board.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/keeper/msg_server_update_board.go#L13-L14]
   package keeper

   import (
       "context"

       "github.com/b9lab/checkers/x/leaderboard/types"
       sdk "github.com/cosmos/cosmos-sdk/types"
   )

   func (k msgServer) UpdateBoard(goCtx context.Context, msg *types.MsgUpdateBoard) (*types.MsgUpdateBoardResponse, error) {
       ctx := sdk.UnwrapSDKContext(goCtx)

-  // TODO: Handling the message
-  _ = ctx
+  board, found := k.GetBoard(ctx)
+  if !found {
+      panic(types.ErrBoardNotFound)
+  }
+  playerInfoList := board.PlayerInfo
+  candidates := make([]types.PlayerInfo, 0, len(msg.GetSigners()))
+  for _, signer := range msg.GetSigners() {
+      candidate, found := k.GetPlayerInfo(ctx, signer.String())
+      if found {
+          candidates = append(candidates, candidate)
+      }
+  }
+  if len(candidates) == 0 {
+      return nil, types.ErrCandidateNotFound
+  }
+  updated := types.UpdatePlayerInfoList(playerInfoList, candidates)
+  board.PlayerInfo = updated
+  k.SetBoard(ctx, board)

       return &types.MsgUpdateBoardResponse{}, nil
   }
```

Also call the two new errors:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/errors.go#L15-L16]
ErrBoardNotFound        = sdkerrors.Register(ModuleName, 1502, "board not found")
ErrCandidateNotFound    = sdkerrors.Register(ModuleName, 1503, "candidate not found")
```

That is it! Now the checkers blockchain can keep track of player information, and create or update the leaderboard based on player input.

### Unit tests

You have created a new expected keeper. Have Mockgen create its mocks by reusing the `make` command prepared earlier:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make mock-expected-keepers
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    make mock-expected-keepers
```

</CodeGroupItem>

</CodeGroup>

Update the checkers keeper factory for tests:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/testutil/keeper/checkers.go#L21-L60]
    func CheckersKeeper(t testing.TB) (*keeper.Keeper, sdk.Context) {
-      return CheckersKeeperWithMocks(t, nil)
+      return CheckersKeeperWithMocks(t, nil, nil)
    }

-  func CheckersKeeperWithMocks(t testing.TB, bank *mock_types.MockBankEscrowKeeper) (*keeper.Keeper, sdk.Context) {
+  func CheckersKeeperWithMocks(t testing.TB, bank *mock_types.MockBankEscrowKeeper, leaderboard *mock_types.MockCheckersLeaderboardKeeper) (*keeper.Keeper, sdk.Context) {
        ...

        k := keeper.NewKeeper(
            bank,
+          leaderboard,
            cdc,
            storeKey,
            memStoreKey,
            paramsSubspace,
        )

        ...

        return k, ctx
    }
```

Because of the change of signature of this function, you need to adjust wherever it is called, like so:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/msg_server_play_move_test.go#L17-L34]
    func setupMsgServerWithOneGameForPlayMove(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context,
-      *gomock.Controller, *mock_types.MockBankEscrowKeeper) {
+      *gomock.Controller, *mock_types.MockBankEscrowKeeper, *mock_types.MockCheckersLeaderboardKeeper) {
        ctrl := gomock.NewController(t)
        bankMock := mock_types.NewMockBankEscrowKeeper(ctrl)
-      k, ctx := keepertest.CheckersKeeperWithMocks(t, bankMock)
+      leaderboardMock := mock_types.NewMockCheckersLeaderboardKeeper(ctrl)
+      k, ctx := keepertest.CheckersKeeperWithMocks(t, bankMock, leaderboardMock)
        checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
        ...
-      return server, *k, context, ctrl, bankMock
+      return server, *k, context, ctrl, bankMock, leaderboardMock
    }
```

You must also change where it is used. Mostly like this, when the leaderboard is not called:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/msg_server_play_move_test.go#L37]
    func TestPlayMove(t *testing.T) {
-      msgServer, _, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
+      msgServer, _, context, ctrl, escrow, _ := setupMsgServerWithOneGameForPlayMove(t)
        defer ctrl.Finish()
        ...
    }
```

Like this, when the leaderboard is called but you are not looking to confirm the calls:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/msg_server_play_move_winner_test.go#L88-L92]
    func TestPlayMoveUpToWinner(t *testing.T) {
-      msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
+      msgServer, keeper, context, ctrl, escrow, board := setupMsgServerWithOneGameForPlayMove(t)
        ctx := sdk.UnwrapSDKContext(context)
        defer ctrl.Finish()
        escrow.ExpectAny(context)
+      board.ExpectAny(context)
        ...
    }
```

This introduces a new function, so (as you did for the bank keeper mock) you add the missing helpers to define expectations. For instance:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/testutil/mock_types/leaderboard_helpers.go]
func (escrow *MockCheckersLeaderboardKeeper) ExpectAny(context context.Context) {
    escrow.EXPECT().MustAddWonGameResultToPlayer(sdk.UnwrapSDKContext(context), gomock.Any()).AnyTimes()
    escrow.EXPECT().MustAddLostGameResultToPlayer(sdk.UnwrapSDKContext(context), gomock.Any()).AnyTimes()
    escrow.EXPECT().MustAddForfeitedGameResultToPlayer(sdk.UnwrapSDKContext(context), gomock.Any()).AnyTimes()
}

func (escrow *MockCheckersLeaderboardKeeper) ExpectWin(context context.Context, who string) *gomock.Call {
    whoAddr, err := sdk.AccAddressFromBech32(who)
    if err != nil {
        panic(err)
    }
    return escrow.EXPECT().MustAddWonGameResultToPlayer(sdk.UnwrapSDKContext(context), whoAddr)
}
...
```

Do not forget to add tests to check that the leaderboard is called as expected:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/checkers/keeper/msg_server_play_move_winner_test.go#L145-L153]
func TestPlayMoveUpToWinnerCalledLeaderboard(t *testing.T) {
    msgServer, _, context, ctrl, escrow, board := setupMsgServerWithOneGameForPlayMove(t)
    defer ctrl.Finish()
    escrow.ExpectAny(context)
    board.ExpectWin(context, bob).Times(1)
    board.ExpectLoss(context, carol).Times(1)

    playAllMoves(t, msgServer, context, "1", game1Moves)
}
```

Do not forget to add some [unit tests](https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/keeper/msg_server_update_board_test.go) for your leaderboard keeper too.

### Forwarding player information via IBC

It is time to look at how you can forward the player information via IBC.

<HighlightBox type="remember">

Remember, you created the module with the `--ibc` flag.

</HighlightBox>

You can scaffold an IBC transaction with:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold packet candidate \
    PlayerInfo:PlayerInfo \
    --module leaderboard
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/leaderboard \
    -w /leaderboard \
    ignitehq/cli:0.22.1 \
    scaffold packet candidate \
    PlayerInfo:PlayerInfo \
    --module leaderboard
```

</CodeGroupItem>

</CodeGroup>

How the message constructor was created makes the player information a parameter. However, you do not want arbitrary player information, but instead want to fetch the creator's player information from the store. To do this, make a small adjustment to `x/leaderboard/client/cli/tx_candidate.go`. Look for the following lines and remove them:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/client/cli/tx_candidate.go#L16]
func CmdSendCandidate() *cobra.Command {
    cmd := &cobra.Command{
-      Use:   "send-candidate [src-port] [src-channel] [player-info]",
+      Use:   "send-candidate [src-port] [src-channel]",
        Short: "Send a candidate over IBC",
-      Args:  cobra.ExactArgs(3),
+      Args:  cobra.ExactArgs(2),
        RunE: func(cmd *cobra.Command, args []string) error {
            ...
-          argPlayerInfo := new(types.PlayerInfo)
-          err = json.Unmarshal([]byte(args[2]), argPlayerInfo)
-          if err != nil {
-              return err
-          }
            ...
-          msg := types.NewMsgSendCandidate(creator, srcPort, srcChannel, argPlayerInfo, timeoutTimestamp)
+          msg := types.NewMsgSendCandidate(creator, srcPort, srcChannel, timeoutTimestamp)
            ...
        },
    }
    ...
    return cmd
}
```

You will also need to remove the import of `encoding/json` because it is not used anymore, and you should remove the parameter `argPlayerInfo` from the `types.NewMsgSendCandidate(...)` call, from [function](https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/types/messages_candidate.go#L12-L22), and not least from `MsgSendCandidate` itself:

```diff-protobuf [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/proto/leaderboard/tx.proto#L23-L28]
    message MsgSendCandidate {
      ...
      uint64 timeoutTimestamp = 4;
-    PlayerInfo playerInfo = 5;
    }
```

The last step is to implement the logic to fetch and send the player information in `x/leaderboard/keeper/msg_server_candidate.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/b9-checkers-academy-draft/x/leaderboard/keeper/msg_server_candidate.go]
    func (k msgServer) SendCandidate(goCtx context.Context, msg *types.MsgSendCandidate) (*types.MsgSendCandidateResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

-      // TODO: logic before transmitting the packet

+      // get the Player data
+      playerInfo, found := k.GetPlayerInfo(ctx, msg.Creator)

+      if !found {
+          return nil, types.ErrCandidateNotFound
+      }

        // Construct the packet
        var packet types.CandidatePacketData

-      packet.PlayerInfo = msg.PlayerInfo
+      packet.PlayerInfo = &playerInfo
        ...
    }
```

You do not handle received packets, because this module is only meant for sending player information to a separate leaderboard chain, which you will create next.
