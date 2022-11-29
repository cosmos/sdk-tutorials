## Extend the Checkers Game with a Leaderboard

Go to your checkers folder and make sure that you are checked out on the [v1-cosmjs-elements](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-cosmjs-elements) tag.
In the Checkers chain folder, you can scaffold a Leaderboard module with Ignite:

```bash
$ ignite scaffold module leaderboard --ibc
```

in order to create and maintain a leaderboard, we need to store the player information. Scaffold a structure with:

```bash
$ ignite scaffold map playerInfo wonCount:uint lostCount:uint dateUpdated:string --module leaderboard --no-message
```

Now you can use this structure to create the board itself:

```bash
$ ignite scaffold single board PlayerInfo:PlayerInfo --module leaderboard --no-message
```

You want those structures as [nullable types](https://en.wikipedia.org/wiki/Nullable_type), so a few adjusments are needed(specially because we do not have a null value for an address). 
You need those adjusments in the protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the `Board`, like:

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

for `proto/leaderboard/board.proto`.

You want to store a win, a loss or a draw if a game ends. Therefore first you should create some helper functions, create a `x/checkers/keeper/player_info_handler.go` file with the following code:

```golang
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

You can see that the Checkers module will need to access the Leaderboard methods, like the `k.board.MustAddWonGameResultToPlayer(...)`. 
First you need to write those functions, create a `x/leaderboard/keeper/player_info_handler.go` file with the following code: 

```golang
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

for the code above to function, you need to define `TimeLayout` in the `x/leaderboard/types/keys.go`. Add the following piece of code at the end of the file:

```golang
const (
    TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
    LeaderboardWinnerLength = uint64(100)
)
```

Now it is time to allow Checkers module the access to the Leaderboard module. Therefore look for the `app.CheckersKeeper` in `app/app.go` and modify it in order to include `app.LeaderboardKeeper`:

```golang
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

In addition you need to modify the `x/checkers/keeper/keeper.go` and include the leaderboard keeper:

```golang
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

Now the Checkers module can call the keeper of the leaderboard modules, so add the call for a win into `x/checkers/keeper/msg_server_play_move.go`:

```golang

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

        // Here we can register a win
        k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    }

    ...
```

and the call for a draw into `x/checkers/keeper/end_block_server_game.go`:

```golang
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

        // Here we can register a draw
        k.MustRegisterPlayerForfeit(ctx, &storedGame)

        storedGame.Board = ""
        k.SetStoredGame(ctx, storedGame)
    }
    
    ...
```

That will do the job and add the player win and loss or forfeit counts into the store. It is time to sort the player and clip the leaderboard to the best 100(`LeaderboardWinnerLength`) players. 
Therefore, scaffold a new transaction:

```bash
$ ignite scaffold message updateBoard --module leaderboard
```

again we can first create some helper functions in `x/leaderboard/keeper/board.go`:


```golang
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

if it cannot parse the date information, it will throw an error which you need to include into `x/leaderboard/types/errors.go`:

```golang
    ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

And you need to call `updateBoard` in the `x/leaderboard/keeper/msg_server_update_board.go`:

```golang
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

That is it! Now the Checkers blockchain can keep track on the player information and create or update the leaderboard due those player information if requested via the CLI.

It is time to see, how you can forward those player information via the IBC protocol. Remember, you created the module with the `--ibc` flag. You can scaffold an IBC transaction with:

```bash
$ ignite scaffold packet candidate PlayerInfo:PlayerInfo --module leaderboard
```

Of course we do not want arbitrary player information but instead we want to fetch the player information from the store, so make a small adjustment in the `x/leaderboard/client/cli/tx_candidate.go`. 
Look for the following lines and remove them:

```golang
    argPlayerInfo := new(types.PlayerInfo)
    err = json.Unmarshal([]byte(args[2]), argPlayerInfo)
    if err != nil {
        return err
    }
```

you will also need to remove the import of `encoding/json` because it is not used anymore and you should remove the parameter `argPlayerInfo` from the `types.NewMsgSendCandidate(...)` call.

The last step for the leaderboard module is to implement the logic for fetching and sending the player information in the `x/leaderboard/keeper/msg_server_candidate.go`:

```golang
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
        errors.New("Player not found")
    }
...
}

```

you do not handle received packages because this module is only for sending the player information to a seperate leaderboard chain which you will create next.
