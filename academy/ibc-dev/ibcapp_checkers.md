# Extend the Checkers Game with a Leaderboard

In the previous sections you saw how to create an IBC-enabled module and chain. The Checkers blockchain has the _token transfer module_ integrated into it as you can test in the relayer sections. However the module `x/checkers` was not generated as _IBC enabled_ like the Leaderboard chain you created with Ignite CLI.  

Here you will extend the Checkers blockchain and include a packet to make it able to send scores to the Leaderboard chain. If you tried the [Migration](/academy/3-my-own-chain/migration.md) section, then you are aware that there is a version of the checkers blockchain with a leaderboard structure. In this section, you will work with this version. 

## Make `x/checkers` IBC enabled

Because `x/checkers` was not generated using the `--ibc` flag, you now need to do some tedious work to make it IBC ready. It is convenient that you can see the difference if using the `--ibc` flag in [Make a module IBC-enabled](./ibcapp_steps.md). Remember the difference, focusing first on the new files:

```txt
create proto/leaderboard/packet.proto
create x/leaderboard/module_ibc.go
create x/leaderboard/types/events_ibc.go
```

As it stands, these files do not even exist in the Checkers blockchain. In the previous sections, you learned why you need those files. Note that a Protobuf file is generated for packet data even before scaffolding a packet, although it includes by default a `NoData` message.

So go ahead and copy:

* `packet.proto` into `proto/checkers`.
* `module_ibc.go` into `x/checkers`.
* `events_ibc.go` into `x/checkers/types`.

Do not forget to adjust the declared packages accordingly.

Next, in the difference, are the modified files. You need to modify too what was modified by Ignite. Namely:

```sh
modify app/app.go
modify proto/leaderboard/genesis.proto
modify testutil/keeper/leaderboard.go
modify x/leaderboard/genesis.go
modify x/leaderboard/types/genesis.go
modify x/leaderboard/types/keys.go
```

At this point, you know why those files were modified when the `--ibc` flag was used to scaffold the Leaderboard chain. You need to apply the same changes to the Checkers blockchain. The Checkers blockchain will need to maintain a version string and will bind to a port for IBC. Remember that Ignite works by looking for comments in the code, and so should you. Do not remove them.

When done, the `x/checkers` module is effectively IBC enabled and you can continue working with Ignite CLI. Scaffold a packet with:

```sh
$ ignite scaffold packet score playerAddress wonCount:uint DateAdded GameID --module checkers
```

This creates some files and modifies others like you saw in the [Adding Packet and Acknowledgement data](./ibcapp_packet.md) section. This packet is named differently from the earlier `ibcTopRank` packet. Its fields have different names too, but if the order and the types of the fields match, IBC will have no problem sending these messages across. Of course by default, the changes made by Ignite have unwanted behaviors, e.g. you are able to send an arbitrary `score` for an arbitrary player to the Leaderboard blockchains.

You can tackle those step by step and implement the application logic in the Checkers blockchain. In addition you must adjust the Leaderboard chain and include in it the same Leaderboard structure you saw in the [Migration](/academy/3-my-own-chain/migration.md) section. You need to touch up a couple of files and the Go compiler will alert you if you missed anything. To save you the trouble, you can clone the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate), which implements all the changes presented in this section so you can focus on what is important.

## Adjust Checkers

Start by adjusting and implementing how a `score` packet is sent. This logic is implemented in `x/checkers/keeper/message_server_score.go`: 

```go
...
func (k msgServer) SendScore(goCtx context.Context, msg *types.MsgSendScore) (*types.MsgSendScoreResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: logic before transmitting the packet

    leaderboard, found := k.GetLeaderboard(ctx)

    if !found {
        errors.New("Leaderboard not found")
    }

    // Construct the packet
    var packet types.ScorePacketData

    found_in_leaderboard := false
    for i := range leaderboard.Winners {
        if leaderboard.Winners[i].PlayerAddress == msg.Sender {
            // found the player, send stats
            packet.PlayerAddress = leaderboard.Winners[i].PlayerAddress
            packet.WonCount = leaderboard.Winners[i].WonCount
            packet.DateAdded = leaderboard.Winners[i].DateAdded
            packet.GameID = msg.ChannelID
            found_in_leaderboard = true
            break
        }
    }

    if !found_in_leaderboard {
        errors.New("Player not found in the leaderboard")
    }

    ...
}
```

As you can see, instead of sending an arbitrary score for an arbitrary player, the system first verifies that the player appears on the leaderboard. Use the `ChannelID` as the unique `GameID`. Now you need to modify the `MsgSendScore` in the `proto/tx.proto` and make it to:

```protobuf
message MsgSendScore {
    string sender = 1;
    string port = 2;
    string channelID = 3;
    uint64 timeoutTimestamp = 4;
}
```

You also need to adjust `x/checkers/client/cli/tx_score.go` to make sure it consumes no arguments. Indeed the `sender` can only be the signer of the transaction and the other fields of the `ScorePacketData` are fetched by `SendScore` in `message_server_score.go`.

Now that you can send such a score packet, what do you do if you receive one? Implement the logic in `x/checkers/keeper/score.go`:

```go
...
// OnRecvScorePacket processes packet reception
func (k Keeper) OnRecvScorePacket(ctx sdk.Context, packet channeltypes.Packet, data types.ScorePacketData) (packetAck types.ScorePacketAck, err error) {
    // validate packet data upon receiving
    if err := data.ValidateBasic(); err != nil {
        return packetAck, err
    }

    score := types.WinningPlayer {
        PlayerAddress: data.PlayerAddress,
        WonCount: data.WonCount,
        DateAdded: data.DateAdded,
    }

    leaderboard, found := k.GetLeaderboard(ctx)
    
    if !found {
        errors.New("Leaderboard not found")
    }

    found_in_leaderboard := false
    for i := range leaderboard.Winners {
        if leaderboard.Winners[i].PlayerAddress == data.PlayerAddress {
            // found the player, update the fields
            leaderboard.Winners[i].WonCount = data.WonCount
            leaderboard.Winners[i].DateAdded = data.DateAdded
            found_in_leaderboard = true
            break
        }
    }

    // we cannot find the player in the leaderboard
    if(!found_in_leaderboard) {
        updated:= append(leaderboard.Winners, &score)
        leaderboard.Winners = updated
    } 
      
    k.SetLeaderboard(ctx, leaderboard)

    return packetAck, nil
}
...
```

Above note the difference between two cases:

* Either the player is not in the leaderboard yet so you append it and their score.
* Or the player can be found in the leaderboard and you update the player's state in the leaderboard.

That is it basically. Now the Checkers blockchain allows you to send and receive score packets. You can add some additional logic, e.g. check if the packet is valid in the `x/checkers/types/packet_score.go`:

```go
...
// ValidateBasic is used for validating the packet
func (p ScorePacketData) ValidateBasic() error {

    // TODO: Validate the packet data

    // return error if player address is empty
    if p.PlayerAddress == "" {
        return errors.New("Player address cannot be empty")
    }

    return nil
}
...
```

## Adjust Leaderboard

In the Leaderboard chain, you need first to do the same steps as in the [Migration](/academy/3-my-own-chain/migration.md) section for the Checkers chain and include a leaderboard. However you will need a slightly different leaderboard structure for the Leaderboard chain:

```
message Board {
    repeated PlayerInfo player = 1; 
    string GameID = 2; 
}
```

This way, you also keep track of the `GameID` and as you can guess, the Leaderboard chain will maintain different leaderboards with different `GameID`s for different chains.

So you can use the same logic as in the Checkers chain to send and receive packets. The difference is that for the Leaderboard chain, the only way to get into one of its leaderboards is by sending score packets from a game chain. (In the Checkers chain, you get into the leaderboard structure only if you win enough games.)

Anyway you keep the sending part untouched because you are interested in receiving packets. In `x/leaderboard/keeper/ibc_top_rank.go` you can find almost the same code as in `x/checkers/keeper/score.go`:

```go
// OnRecvIbcTopRankPacket processes packet reception
func (k Keeper) OnRecvIbcTopRankPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcTopRankPacketData) (packetAck types.IbcTopRankPacketAck, err error) {
    // validate packet data upon receiving
    if err := data.ValidateBasic(); err != nil {
        return packetAck, err
    }

    // TODO: packet reception logic

    score:= types.PlayerInfo {
        PlayerID: data.PlayerId,
        Score: data.Score,
        DateAdded: data.DateAdded,
    }

    leaderboard, found := k.GetBoard(ctx, data.GameId)
    
    if !found {
        board:= types.Board {
            Player:[]*types.PlayerInfo{&score},
            GameID: data.GameId,        
        }

        k.SetBoard(ctx, board)
    }

    found_in_leaderboard := false
    for i := range leaderboard.Player {
        if leaderboard.Player[i].PlayerID == data.PlayerId {
            // found the player, update the fields
            leaderboard.Player[i].Score = data.Score
            leaderboard.Player[i].DateAdded = data.DateAdded
            found_in_leaderboard = true
            break
        }
    }

    // we cannot find the player in the leaderboard
    if(!found_in_leaderboard) {
        updated:= append(leaderboard.Player, &score)
        leaderboard.Player = updated
    } 
      
    k.SetBoard(ctx, leaderboard)

    return packetAck, nil
}
```

and in `x/leaderboard/types/packet_ibc_top_rank.go` you add some validation logic:

```go
...

// ValidateBasic is used for validating the packet
func (p IbcTopRankPacketData) ValidateBasic() error {

  // TODO: Validate the packet data
  
  // check the gameID
  if p.GameID != p.ChannelID {
    return errors.New("GameID does not match")
  }

  return nil
}
...
```

This way you make sure that a chain can only update its own leaderboard, and not that of another chain if it sent a wrong `GameID`. 

## Test with Docker

You can find a test network in the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate). First clone the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate) and build the docker image for the Checkers chain:

```sh
$ cd cosmos-ibc-docker/separate/checkers
$ docker build -f Dockerfile . -t checkers --build-arg configyml=./config.yml --no-cache
```

And then the image for the the Leaderboard chain:

```sh
$ cd cosmos-ibc-docker/separate/leaderboard
$ docker build -f Dockerfile . -t leaderboard --build-arg configyml=./config.yml --no-cache
```

As well as the image for the relayer:

```sh
$ cd cosmos-ibc-docker/separate/relayer
$ docker build -f Dockerfile . -t relayer --no-cache
```

You can use the provided compose file to spin up a network with a Checkers blockchain and a Leaderboard blockchain as well as a relayer to relay between them:

```sh
$ cd cosmos-ibc-docker/separate
$ docker-compose -f separate.yml up

```

Observe the output of `docker-compose` until the chains are ready - it takes some time for the chains to be ready. When they are ready, you can start the relayer process with:

```sh
$ docker exec relayer ./run-relayer.sh 
```

Wait till the connection is etablished and a channel is created. 

Then jump into the checkers container:

```sh
$ docker exec -it checkers bash
```

Let the test script create and play a game:

```sh
$ ./test.sh 1 checkers cosmos1n4mqetruv26lm2frkjah86h642ts84qyd5uvyz cosmos14y0kdvznkssdtal2r60a8us266n0mm97r2xju8
```

You can use this script many times but make sure to increment the first argument (seen as `1` above), which indicates the game index.

This again takes some time and you see transactions flying around. When the game is over, you can query the local leaderboard of the Checkers chain with:

```sh
$ checkersd query checkers show-leaderboard
```

Now you can send the score via:

```sh
$ checkersd tx checkers send-score checkers channel-0 --from cosmos1n4mqetruv26lm2frkjah86h642ts84qyd5uvyz --chain-id checkers
```

Remember that only the winner of the game shows up in the local leaderboard of the Checkers chain, so there is no score for the loser to send yet. 

After a short time, you can find a new entry in the leaderboard of the Leaderboard chain. Therefore jump into leaderboard chain:

```sh
$ docker exec -it leaderboard bash
```

And check the board:

```sh
$ leaderboardd query leaderboard list-board
```