# Extend the Checkers Game With a Leaderboard

Go to your checkers folder and make sure that you checked out of the [v1-cosmjs-elements](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-cosmjs-elements) tag.

In the checkers chain folder, you can scaffold a leaderboard module with Ignite:

```bash
$ ignite scaffold module leaderboard --ibc
```

In order to create and maintain a leaderboard, you need to store the player information.

Scaffold a structure with:

```bash
$ ignite scaffold map playerInfo wonCount:uint lostCount:uint dateUpdated:string --module leaderboard --no-message
```

Now you can use this structure to create the board itself:

```bash
$ ignite scaffold single board PlayerInfo:PlayerInfo --module leaderboard --no-message
```

You want the structures as [nullable types](https://en.wikipedia.org/wiki/Nullable_type), so a few adjustments are needed - especially because you do not have a null value for an address.

You need to do the adjustments in the Protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the `Board`, like:

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

You want to store a win, a loss, or a draw if a game ends. Therefore, you should create some helper functions first. Create a `x/checkers/keeper/player_info_handler.go` file with the following code:

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

You can see that the checkers module will need to access the leaderboard methods, like `k.board.MustAddWonGameResultToPlayer(...)`.

First, you need to write those functions. Create a `x/leaderboard/keeper/player_info_handler.go` file with the following code: 

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

For the code above to function, you need to define `TimeLayout` in the `x/leaderboard/types/keys.go`. Add the following piece of code at the end of the file:

```golang
const (
    TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
    LeaderboardWinnerLength = uint64(100)
)
```

Now it is time to allow the checkers module access to the leaderboard module. Therefore, look for the `app.CheckersKeeper` in `app/app.go` and modify it in order to include `app.LeaderboardKeeper`:

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

In addition, you need to modify `x/checkers/keeper/keeper.go` and include the leaderboard keeper:

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

Now the checkers module can call the keeper of the leaderboard module, so add the call for a win in `x/checkers/keeper/msg_server_play_move.go`:

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

        // Here you can register a win
        k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    }

    ...
```

and the call for a draw in `x/checkers/keeper/end_block_server_game.go`:

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

        // Here you can register a draw
        k.MustRegisterPlayerForfeit(ctx, &storedGame)

        storedGame.Board = ""
        k.SetStoredGame(ctx, storedGame)
    }
    
    ...
```

That will get the job done and add the player win, loss, or forfeit counts to the store.

It is time to sort the players and clip the leaderboard to the best 100(`LeaderboardWinnerLength`) players. Thus, scaffold a new transaction:

```bash
$ ignite scaffold message updateBoard --module leaderboard
```

Again, you can first create some helper functions in `x/leaderboard/keeper/board.go`:


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

If it cannot parse the date information, it will throw an error that you need to include in `x/leaderboard/types/errors.go`:

```golang
    ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

And you need to call `updateBoard` in `x/leaderboard/keeper/msg_server_update_board.go`:

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

That is it! Now the checkers blockchain can keep track of the player information, and create or update the leaderboard based on the player information if requested via the CLI.

It is time to look at how you can forward the player information via the IBC protocol.

<HighlightBox type="remember">

Remember, you created the module with the `--ibc` flag.

</HighlightBox>

You can scaffold an IBC transaction with:

```bash
$ ignite scaffold packet candidate PlayerInfo:PlayerInfo --module leaderboard
```

Of course, you do not want arbitrary player information but instead want to fetch the player information from the store, so make a small adjustment in `x/leaderboard/client/cli/tx_candidate.go`. Look for the following lines and remove them:

```golang
    argPlayerInfo := new(types.PlayerInfo)
    err = json.Unmarshal([]byte(args[2]), argPlayerInfo)
    if err != nil {
        return err
    }
```

You will also need to remove the import of `encoding/json` because it is not used anymore and you should remove the parameter `argPlayerInfo` from the `types.NewMsgSendCandidate(...)` call.

The last step is to implement the logic to fetch and send player information in `x/leaderboard/keeper/msg_server_candidate.go`:

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

You do not handle received packages because this module is only meant for sending player information to a separate leaderboard chain, which you will create next.

## Create a leaderboard chain

After extending the checkers chain with a leaderboard module, the checkers game can keep track of the player stats and it can maintain (on request) a sorted leaderboard. In addition, it can send player stats via IBC to another chain.

You will now create a leaderboard chain that can receive the packages. Determine another folder for your leaderboard chain, and scaffold a chain via Ignite:

```bash
ignite scaffold chain leaderboard --no-module
```

And again, you can include a leaderboard module with IBC enabled in it:

```bash
ignite scaffold module leaderboard --ibc
```

You need a structure to keep track of the player information too:

```bash
$ ignite scaffold map playerInfo wonCount:uint lostCount:uint dateUpdated:string --module leaderboard --no-message
```

and of course a board structure:

```bash
$ ignite scaffold single board PlayerInfo:PlayerInfo --module leaderboard --no-message
```

In addition, you want to receive candidate packages:

```bash
ignite scaffold packet candidate PlayerInfo:PlayerInfo --module leaderboard --no-message
```

This time you use the `--no-message` flag because this chain is not going to send any player information to another chain.

Implement the logic for the packet received in `x/leaderboard/keeper/candidate.go`:

```golang
...
// OnRecvCandidatePacket processes packet reception
func (k Keeper) OnRecvCandidatePacket(ctx sdk.Context, packet channeltypes.Packet, data types.CandidatePacketData) (packetAck types.CandidatePacketAck, err error) {
    // validate packet data upon receiving
    if err := data.ValidateBasic(); err != nil {
        return packetAck, err
    }

    // TODO: packet reception logic

    allPlayerInfo := k.GetAllPlayerInfo(ctx)

    found_in_player_list:= false
    for i := range allPlayerInfo {
        if allPlayerInfo[i].Index == data.PlayerInfo.Index {
            allPlayerInfo[i] = *data.PlayerInfo;
            found_in_player_list = true
            break
        }
    }

    if !found_in_player_list {
        k.SetPlayerInfo(ctx, *data.PlayerInfo)
    }

    return packetAck, nil
}
...
```

In addition, add a basic validation to `x/leaderboard/types/packet_candidate.go`:

```golang
package types

import (
    "errors"
)

// ValidateBasic is used for validating the packet
func (p CandidatePacketData) ValidateBasic() error {

    // TODO: Validate the packet data

  // return error if the player address is empty
  if p.PlayerInfo.Index == "" {
      return errors.New("Player address cannot be empty")
  }

    return nil
}
```

Now your leaderboard chain can receive player information from chains with the leaderboard module.

You need to do some more work to update the board with that information.

There are two places at which you can call for an update on the board structure, in `OnRecvCandidatePacket` so each player sending his/her information will pay the fee for sorting and clipping the leaderboard, or you can again create a separate transaction for anyone to sort and clip the leaderboard on the leaderboard chain like you did for the checkers chain.

Take this as an opportunity to practice and implement it in `OnRecvCandidatePacket`.

## Test it

You can find the sample implementation of the checkers chain extension and the leaderboard chain on a [repository we provide](https://github.com/b9lab/cosmos-ibc-docker/tree/ao-modular/modular). There you will also find a Docker network and the relayer settings for an easy test. In addition, the repository includes a script to create and run games. Follow the steps described in the repository to run a few tests and to see it in action.
