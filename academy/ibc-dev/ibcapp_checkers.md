# Extend the Checkers Game with a Leaderboard

In the previous sections you saw how to create a IBC enabled module and chain. 
The `checkers` blockchain has the token transfer module integrated as you can test in the relayer sections but the module `x/checkers` is not generated as IBC enabled like the `leaderboard` chain you created with the Ignite CLI.  

Here you will extend the `checkers` blockchain and include a packet to make it able to send scores to the `leaderboard` chain. If you tried the [Migration](add_link) section, then you are aware that there is a version of the `checkers` blockchain with a leaderboard structure. In the following section, you will to work with this version. 

## Make `x/checkers` IBC enabled

Because `x/checkers` is not generated using the `--ibc` flag, you will need to do some tedious work to make it IBC ready. It is handy that you can see the difference if using the `--ibc` flag in the [Make a module IBC-enabled](./ibcapp_steps.md). Let us remember the difference, focus first on what was additional created:

```bash
create proto/leaderboard/packet.proto
create x/leaderboard/module_ibc.go
create x/leaderboard/types/events_ibc.go
```

Those are files, you do not have in the `checkers` blockchain by default. You should also know because of the previous sections, why you need those files. Note that a protobuf file is generated for packet data even before scaffolding a packet but it includes by default just a `NoData` message.

Basically you can copy the `packet.proto` file into `proto/checkers` and `module_ibc.go` file into `x/checkers` as well as `events_ibc.go` file into `x/checkers/types`. 
Next you need to modify what was modified by Ignite:

```bash
modify app/app.go
modify proto/leaderboard/genesis.proto
modify testutil/keeper/leaderboard.go
modify x/leaderboard/genesis.go
modify x/leaderboard/types/genesis.go
modify x/leaderboard/types/keys.go
```

At this point, you should know why those files are modified if the `--ibc` flag is used to scaffold the `leaderboard` chain. You need to apply same changes to the `checkers` blockchain. The `checkers` blockchain will need to maintain a version string and will bind to a port for IBC. Note that Ignite works by looking for comments in the code, so it is important to include them too.

If successfull, the `x/checkers` module will be IBC enabled and you can continue working with the Ignite CLI. Now you can scaffold a packet with:

```bash
ignite scaffold packet score playerAddress wonCount:uint DateAdded GameID --module checkers
```

It will create some files and modify others like you saw in the [Adding Packet and Acknowledgement data](./ibcapp_packet.md) section. This packet has a different name as `ibcTopRank` packet and it's fields have different names too but if the order and the types of the fields match, IBC will allow to exchange messages. Of course by default, the changes made by Ignite will have unwanted behaviors, e.g. you are able to send an arbitrary score for an arbitrary player to the leaderboard. 

You can tackle those step by step and implement the application logic in the `checkers` blockchain. In addition you must adjust the `leaderboard` chain and include in it the same `leaderboard` structure you saw in the [Migration](add_link) section. There are a couple of files need to be touched and the Go compiler will be your helper if you miss something. To save you the trouble, you can clone the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate) which implements all those changes presented in the following section so you can focus on what is important.

## Adjust `checkers`

Let us start by adjusting and implementing how a score packet is sent. Therefore, first the `x/checkers/keeper/message_server_score.go` needs to implement the logic for the packet to be sent:

```golang

...

func (k msgServer) SendScore(goCtx context.Context, msg *types.MsgSendScore) (*types.MsgSendScoreResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)

  // TODO: logic before transmitting the packet

  leaderboard, found := k.GetLeaderboard(ctx)

  if !found {
    panic("Leaderboard not found")
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
    panic("Player not found in the leaderboard")
  }

  ...
}

```

As you can see, instead of sending an arbitrary score for an arbitrary player, we look for the player information in the leaderboard. We use the `ChannelID` as the unique `GameID`. Now you need to modify the `MsgSendScore` in the `proto/tx.proto` and make it to:

```
message MsgSendScore {
  string sender = 1;
  string port = 2;
  string channelID = 3;
  uint64 timeoutTimestamp = 4;
}
```

You will also need to adjust the `x/checkers/client/cli/tx_score.go` to make it consume no arguments because the `sender` can only be the signer of the transaction and the other fields of the `ScorePacketData` are fetched by the `message_server_score.go`. 

Now we can send such a score packet, what do we do if we receive one? We can implement our logic in the `x/checkers/keeper/score.go`:

```golang

...

// OnRecvScorePacket processes packet reception
func (k Keeper) OnRecvScorePacket(ctx sdk.Context, packet channeltypes.Packet, data types.ScorePacketData) (packetAck types.ScorePacketAck, err error) {
  // validate packet data upon receiving
  if err := data.ValidateBasic(); err != nil {
    return packetAck, err
  }

  score:= types.WinningPlayer {
    PlayerAddress: data.PlayerAddress,
    WonCount: data.WonCount,
    DateAdded: data.DateAdded,
  }

  leaderboard, found := k.GetLeaderboard(ctx)
  
  if !found {
    panic("Leaderboard not found")
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

Above you can see that we differentiate between two cases: either the player is not in the leaderboard yet so we need to append the player and the score or the player can be found in the leaderboard and we need to update the player state. That is it basically. Now the `checkers` blockchain will allow you to send and receive score packets. You can add some additional logic, e.g. check if the packet is valid in the `x/checkers/types/packet_score.go`:

```golang
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

## Adjust `leaderboard`

In the `leaderboard` chain, you need first to do the same steps as in the [Migration](add_link) section for the `checkers` chain and include a leaderboard but you will need a slightly different leaderboard structure for the `leaderboard` chain:

```
message Board {
  repeated PlayerInfo player = 1; 
  string GameID = 2; 
}
```

This way, you keep also track of the `GameID` and as you can guess, the `leaderboard` chain will maintain different leaderboards with different `GameID`s for different chains.

So you can use the same logic as in the `checkers` chain to send and receive packets. The difference is that for the `leaderboard` chain, the only way to get into one of it's leaderboard is by sending score packets from a game chain.(In `checkers` chain, you will get into the leaderboard structure if you win enough games.)

Anyway we will keep the sending part untouched because we are interested in receiving packets. In the `x/leaderboard/keeper/ibc_top_rank.go` you can find almost the same code as in the `x/checkers/keeper/score.go`:

```golang
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

and in the `x/leaderboard/types/packet_ibc_top_rank.go` we can add some validation logic:

```golang

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

this way we make sure that we do not give any other chain the permission to alter the wrong leaderboard by sending a wrong `GameID`. 

## Test with Docker

You can find a test network in the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate). First you will need clone the [sample](https://github.com/b9lab/cosmos-ibc-docker/tree/main/separate) and build the docker image for the `checkers` chain:

```bash
$ cd cosmos-ibc-docker/separate/checkers
$ docker build -f Dockerfile . -t checkers --build-arg configyml=./config.yml --no-cache
```

and then the image for the the `leaderboard` chain:

```bash
$ cd cosmos-ibc-docker/separate/leaderboard
$ docker build -f Dockerfile . -t leaderboard --build-arg configyml=./config.yml --no-cache
```

as well as the image for the relayer:

```bash
$ cd cosmos-ibc-docker/separate/relayer
$ docker build -f Dockerfile . -t relayer --no-cache
```

You can use the provided compose file to spin up a network with a `checkers` blockchain and a `leaderboard` blockchain as well as a relayer to relay between them:

```bash
$ cd cosmos-ibc-docker/separate
$ docker-compose -f separate.yml up

```

Observe the output of `docker-compose` until the chains are ready - it will take some time for the chains to be ready. If the chains are ready, you can start the relayer process with:

```bash
$ docker exec relayer ./run-relayer.sh 
```

wait till the connection is etablished and a channel is created. 

Then jump into checkers container:

```bash
$ docker exec -it checkers bash
```

let the test script create and play a game:

```bash
$ ./test.sh 1 checkers cosmos1n4mqetruv26lm2frkjah86h642ts84qyd5uvyz cosmos14y0kdvznkssdtal2r60a8us266n0mm97r2xju8
```

You can use this script many times but make sure to increase the first argument, which indicates the game index.

This again will take some time and you will see transaction flying around. If the game is over, you can query the local leaderboard of the `checkers` chain with:

```bash
$ checkersd q checkers show-leaderboard
```

Now you can send the score via:

```bash
$ checkersd tx checkers send-score checkers channel-0 --from cosmos1n4mqetruv26lm2frkjah86h642ts84qyd5uvyz --chain-id checkers
```

Note that only the winner of the game will be in the local leaderboard of the `checkers` chain so there is no score for the loser to send yet. 

After a short time, you can find a new entry in the leaderboard of the `leaderboard` chain. Therefore jump into leaderboard chain:

```bash
$ docker exec -it leaderboard bash
```

and check the board:

```bash
$ leaderboardd q leaderboard list-board
```