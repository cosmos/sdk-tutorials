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

You will now create a leaderboard chain that can receive the `Candidate` packets to store in a **global leaderboard**.

Create another folder for your leaderboard chain, and scaffold a chain via Ignite CLI:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite ignite scaffold chain leaderboard --no-module
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/parent \
    -w /parent \
    ignitehq/cli:0.22.1 \
    scaffold chain leaderboard --no-module
```

</CodeGroupItem>

</CodeGroup>

Go into it:

```sh
$ cd leaderboard
```

Again, you can include an IBC-enabled leaderboard module in it:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold module leaderboard --ibc
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/leaderboard \
    -w /leaderboard \
    ignitehq/cli:0.22.1 \
    scaffold module leaderboard --ibc
```

</CodeGroupItem>

</CodeGroup>

You need a structure to keep track of player information too:

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

And of course a board structure:

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

In addition, you want to receive candidate packets:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold packet candidate \
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
    scaffold packet candidate \
    PlayerInfo:PlayerInfo \
    --module leaderboard \
    --no-message
```

</CodeGroupItem>

</CodeGroup>

This time you use the `--no-message` flag because this chain is not going to send any player information to other chains.

<HighlightBox type="tip">

As in the previous section, you need to make adjustments in the Protobuf files `proto/leaderboard/board.proto` and `proto/leaderboard/genesis.proto`. Make sure to import `gogoproto/gogo.proto` and use `[(gogoproto.nullable) = false];` for the `PlayerInfo` and the `Board`. You will also need to adjust the `x/leaderboard/genesis_test.go` like you did in the previous section.

</HighlightBox>

Implement the logic for receiving packets in `x/leaderboard/keeper/candidate.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/keeper/candidate.go#L77-L78]
    // OnRecvCandidatePacket processes packet reception
    func (k Keeper) OnRecvCandidatePacket(ctx sdk.Context, packet channeltypes.Packet, data types.CandidatePacketData) (packetAck types.CandidatePacketAck, err error) {
        // validate packet data upon receiving
        if err := data.ValidateBasic(); err != nil {
            return packetAck, err
        }

-      // TODO: packet reception logic
+      // Override the entry
+      k.SetPlayerInfo(ctx, *data.PlayerInfo)

        return packetAck, nil
    }
```

In addition, add a basic validation into `x/leaderboard/types/packet_candidate.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/types/packet_candidate.go#L10-L14]
+  import (
+      "errors"
+  )

    // ValidateBasic is used for validating the packet
    func (p CandidatePacketData) ValidateBasic() error {

-      // TODO: Validate the packet data
+      // return error if player info is incorrect
+      playerInfoErr := p.PlayerInfo.ValidateBasic()
+      if playerInfoErr != nil {
+          return playerInfoErr
+      }

        return nil
    }
```

This calls up a new validation on the `PlayerInfo`, which you also have to declare:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/types/player_info.go]
func (info PlayerInfo) ValidateBasic() error {
    _, err := sdk.AccAddressFromBech32(info.Index)
    if err != nil {
        return err
    }
    return nil
}
```

Now your leaderboard chain can receive player information from chains with the leaderboard module! However, you need to do some more work in order to update the board on this information.

There are two places where you can call for an update on the board structure:

* In `OnRecvCandidatePacket`, so each player sending information will pay the fee for sorting and clipping the leaderboard. This is the choice here, for simplicity.
* Or you can change your data structure a little bit and handle the sorting and clipping of the leaderboard in `EndBlock`.

Here you will extend the `x/leaderboard/keeper/candidate.go` file in order to call for a leaderboard update in `OnRecvCandidatePacket`. You need to create some helper functions in a new `x/leaderboard/typesboard.go/board.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/types/board.go]
func ParseDateAddedAsTime(dateAdded string) (dateAddedParsed time.Time, err error) {
    dateAddedParsed, errDateAdded := time.Parse(TimeLayout, dateAdded)
    return dateAddedParsed, sdkerrors.Wrapf(errDateAdded, ErrInvalidDateAdded.Error(), dateAdded)
}

func SortPlayerInfo(playerInfoList []PlayerInfo) {
    sort.SliceStable(playerInfoList[:], func(i, j int) bool {
        if playerInfoList[i].WonCount > playerInfoList[j].WonCount {
            return true
        }
        if playerInfoList[i].WonCount < playerInfoList[j].WonCount {
            return false
        }
        firstPlayerTime, _ := ParseDateAddedAsTime(playerInfoList[i].DateUpdated)
        secondPlayerTime, _ := ParseDateAddedAsTime(playerInfoList[j].DateUpdated)

        return firstPlayerTime.After(secondPlayerTime)
    })
}
```

And in `x/leaderboard/keeper/board.go`, introduce a new `UpdateBoard` function:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/keeper/board.go#L36-L46]
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

Again, do not forget to declare the new error type in `x/leaderboard/types/errors.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/types/errors.go#L14]
ErrInvalidDateAdded     = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

You also need to define `TimeLayout` in `x/leaderboard/types/keys.go`:

```go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/types/keys.go#L40]
TimeLayout              = "2006-01-02 15:04:05.999999999 +0000 UTC"
```

Then you can include a call to `UpdateBoard` call in `x/leaderboard/keeper/candidate.go`:

```diff-go [https://github.com/b9lab/cosmos-ibc-docker/blob/main/modular/leaderboard/x/leaderboard/keeper/candidate.go#L80-L97]
    // OnRecvCandidatePacket processes packet reception
    func (k Keeper) OnRecvCandidatePacket(ctx sdk.Context, packet channeltypes.Packet, data types.CandidatePacketData) (packetAck types.CandidatePacketAck, err error) {
        ...
        k.SetPlayerInfo(ctx, *data.PlayerInfo)

+      // Update the board
+      board, found := k.GetBoard(ctx)
+      if !found {
+          panic("Leaderboard not found")
+      }
+      listed := board.PlayerInfo
+      replaced := false
+      for i := range listed {
+          if listed[i].Index == data.PlayerInfo.Index {
+              listed[i] = *data.PlayerInfo
+              replaced = true
+              break
+          }
+      }
+      if !replaced {
+          listed = append(listed, *data.PlayerInfo)
+      }
+      k.UpdateBoard(ctx, listed)

        return packetAck, nil
    }
```

With this, your leaderboard chain is ready to update its leaderboard when receiving a candidate packet.

## Test it

You can find the sample implementation of the checkers chain extension and the leaderboard chain in [this repository](https://github.com/b9lab/cosmos-ibc-docker/tree/ao-modular/modular). There you will also find a Docker network and the relayer settings for an easy test. It also includes a script to create and run games.

Follow the steps described in the repository to run a few tests and to see it in action. If you want to do the tests with your chains, replace `modular/b9-checkers-academy-draft` with your checkers chain and `modular/leaderboard` with your leaderboard chain, and build the docker images.
