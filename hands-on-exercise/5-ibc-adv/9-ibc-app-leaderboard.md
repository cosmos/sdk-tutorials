---
title: "Create a Leaderboard Chain"
order: 9
description: A global leaderboard for your games
tags: 
  - concepts
  - ibc
  - dev-ops
---

# Create a Leaderboard Chain

<HighlightBox type="learning">

In this section, you will learn:

* How to create an IBC-enabled chain that can receive information from other chains.
* How to send player scores from your extended checkers chain to a global leaderboard chain via IBC.

</HighlightBox>

After the extension of the checkers chain with a leaderboard module, the checkers game can keep track of player stats and it can maintain (on request) a sorted leaderboard. In addition, it can send player stats via the Inter-Blockchain Communication Protocol (IBC) to another chain.

You will now create a leaderboard chain that can receive the `Candidate` packets to store a **global leaderboard**.

Determine another folder for your leaderboard chain, and scaffold a chain via Ignite CLI:

```bash
ignite scaffold chain leaderboard --no-module
```

Again, you can include an IBC-enabled leaderboard module in it:

```bash
ignite scaffold module leaderboard --ibc
```

You need a structure to keep track of player information too:

```bash
$ ignite scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint dateUpdated:string --module leaderboard --no-message
```

And of course a board structure:

```bash
$ ignite scaffold single board PlayerInfo:PlayerInfo --module leaderboard --no-message
```

In addition, you want to receive candidate packets:

```bash
ignite scaffold packet candidate PlayerInfo:PlayerInfo --module leaderboard --no-message
```

This time you use the `--no-message` flag because this chain is not going to send any player information to another chain.


<HighlightBox type="tip">

As in the previous section, you need to make adjustments in the Protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the `Board`. You will also need to adjust the `x/leaderboard/genesis_test.go` like you did in the previous section.

</HighlightBox>

Implement the logic for receiving packets in `x/leaderboard/keeper/candidate.go`:

```go
...
// OnRecvCandidatePacket processes packet reception
func (k Keeper) OnRecvCandidatePacket(ctx sdk.Context, packet channeltypes.Packet, data types.CandidatePacketData) (packetAck types.CandidatePacketAck, err error) {
    // validate packet data upon receiving
    if err := data.ValidateBasic(); err != nil {
        return packetAck, err
    }

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

In addition, add a basic validation into `x/leaderboard/types/packet_candidate.go`:

```go
package types

import (
    "errors"
)

// ValidateBasic is used for validating the packet
func (p CandidatePacketData) ValidateBasic() error {

  // return error if player address is empty
  if p.PlayerInfo.Index == "" {
      return errors.New("player address cannot be empty")
  }

    return nil
}
```

Now your leaderboard chain can receive player information from chains with the leaderboard module! However, you need to do some more work in order to update the board on this information.

There are two places where you can call for an update on the board structure:

* In `OnRecvCandidatePacket`, so each player sending information will pay the fee for sorting and clipping the leaderboard.
* Or you can again create a separate transaction for anyone to sort and clip the leaderboard on the leaderboard chain as you did for the checkers chain.

Here you will extend the `x/leaderboard/keeper/candidate.go` file in order to call for an update in `OnRecvCandidatePacket`. You need to create some helper functions in `x/leaderboard/keeper/board.go` and adjust the `updateBoard` function.


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

    func (k Keeper) UpdateBoard(ctx sdk.Context, playerInfoList []types.PlayerInfo) {
        SortPlayerInfo(playerInfoList)

        if types.LeaderboardWinnerLength < uint64(len(playerInfoList)) {
            playerInfoList = playerInfoList[:types.LeaderboardWinnerLength]
        }

        k.SetBoard(ctx, types.Board {
            PlayerInfo: playerInfoList,
        })
    }
```

Again, you need to include the error type in `x/leaderboard/types/errors.go`:

```go
    ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

You also need to define `TimeLayout` in `x/leaderboard/types/keys.go`:

```go
    TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
```

Then you can include a `updateBoard` call in `x/leaderboard/keeper/candidate.go`:

```go
...
// OnRecvCandidatePacket processes packet reception
func (k Keeper) OnRecvCandidatePacket(ctx sdk.Context, packet channeltypes.Packet, data types.CandidatePacketData) (packetAck types.CandidatePacketAck, err error) {
    // validate packet data upon receiving
    if err := data.ValidateBasic(); err != nil {
        return packetAck, err
    }

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

    // Here we can fetch the PlayerInfo and update the board
    playerInfoList := k.GetAllPlayerInfo(ctx)
    k.UpdateBoard(ctx, playerInfoList)

    return packetAck, nil
}
...
```

## Test it

You can find the sample implementation of the checkers chain extension and the leaderboard chain in [this repository](https://github.com/b9lab/cosmos-ibc-docker/tree/ao-modular/modular). There you will also find a Docker network and the relayer settings for an easy test. It also includes a script to create and run games.

Follow the steps described in the repository to run a few tests and to see it in action. If you want to do the tests with your chains, replace `modular/b9-checkers-academy-draft` with your checkers chain and `modular/leaderboard` with your leaderboard chain, and build the docker images.
