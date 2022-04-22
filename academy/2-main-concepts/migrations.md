---
title: "Migrations"
order: 13
description: How to handle on-chain upgrades
tag: deep-dive
---

# Migrations: on-chain upgrades

<HighlightBox type="synopsis">

Have you ever wondered how an upgrade is done in the Cosmos SDK? Take time to find out how Cosmos SDK migrations are conducted.

The process is orderly; blockchains can be upgraded through a predictable process that reliably avoids forks. Discover the Cosmos comprehensive process that includes governance, data migrations, node upgrades, and more to ensure upgrades proceed smoothly and without service disruption.

To better understand this section, look at the following sections :

* [Messages](./messages.md)
* [Protobuf](./protobuf.md)

</HighlightBox>

A Cosmos SDK application running on a Cosmos blockchain can be upgraded in an orderly, on-chain fashion.

Upgrading blockchains and blockchain applications is notoriously difficult and risky. The Cosmos SDK solves the common risks and challenges.

Generally, when a blockchain is upgraded it is vital that all nodes upgrade simultaneously and at the same block height. This is difficult to achieve in a disorderly setting. If the nodes do not do so then the blockchain will "fork" into two blockchains with common history: one chain that observes the new rules and one chain that observes the old rules. It is generally not possible for the two chains to reach a common consensus or merge in the future.

<HighlightBox type="info">

Upgrading a live chain without software support for upgrades is risky because all the validators need to pause their state machines at the same block height and apply the upgrade before resuming. If this is not done correctly, there can be state inconsistencies, which are hard to recover from.

</HighlightBox>

Smart contracts on EVM chains such as Ethereum are immutable software. They are difficult or impossible to change by definition. Various strategies based on modularity can simulate the effects of upgrading the smart contracts but all known methods have inherent limitations. Chief among the limitations are the difficulties, impossibility, or prohibitive costs of re-organizing data at rest. This places a significant limitation on the types of upgrades that are feasible.

A Cosmos SDK blockchain built for a specific application can be upgraded without forks. In the case that a new version of the blockchain application uses a different data layout than exists on the chain, the existing data can be reorganized before the new version of the application comes online. The data migration is defined by the developer and runs in each node quickly and cost-effectively before the node returns to service.

## Process overview

### Plan

A "plan" is an upgrade process to take place at a specific block height in the future. It includes a `SideCar` (see below) that executes when the upgrade process commences, there is a name of the plan and a block height at which to execute. Acceptance or rejection of the plan is managed through the normal governance process. A "cancel proposal" can be submitted and adopted preventing the plan from executing. Cancellation is contingent on knowing that a given plan is a poor idea before the upgrade happens.

The `Info` in a plan kicks off the `SideCar` process:

```shell
type Plan struct {
  Name   string
  Height int64
  Info   string
}
```

### `Sidecar` process

A `SideCar` is a binary the nodes can run to attend to processes outside of Cosmos binaries. This can include steps such as downloading and compiling software from a certain commit in a repo.

### `UpgradeHandler`

A `UpgradeHandler` may be executed after the `SideCar` process is finished and the binary has been upgraded. An upgrade handler attends to on-chain activities that may be necessary before normal processing resumes. An upgrade handler may trigger a `StoreLoader`.

### `StoreLoader`

A `StoreLoader` prepares the on-chain state for use by the new binary. This can include reorganizing existing data. The node does not resume normal operation until the store loader has returned and the handler has completed its work.

### Proposal

Governance uses proposals that are voted on, adopted, or rejected. An upgrade proposal takes the form of accepting or rejecting a plan that is prepared and submitted through governance. Proposals can be withdrawn before execution with cancellation proposals.

## Advantages

Coordinated upgrades attend to the challenging process of upgrading blockchain applications and blockchain platforms.

The main advantages of this form of coordinated upgrades are:

* **Avoidance of forks:** all validators move together at a pre-determined block height.
* **Smooth upgrade of binaries:** the new software is adopted in an automated fashion.
* **Reorganizing data stores:** data at rest can be reorganized as needed by processes that are not limited by factors such as a block gas limit.

## Effect of upgrades

Blockchains are paused at the block height of an adopted plan. This initiates the upgrade process. The upgrade process itself may include switching to a new binary that is relatively small to download and install, or it may include an extensive data reorganization process. The validator stops processing blocks until it completes the process in either case. The validator resumes processing blocks when the handler is satisfied with the completeness degree of the upgrade. From a user perspective, this appears as a pause and resumes with the new version.

## Application-specific

The `SideCar`, handler, and store loader are application-specific. At each block, the Cosmos SDK checks for a plan that should be executed before processing block transactions. If none exists, then processing continues as usual. If a plan is scheduled to run, then the Cosmos SDK pauses normal processing and loads the `SideCar`. When the SideCar is finished it loads the handler and optionally the store loader.

Application developers build implementations of those components that are tailored to their application and use case.

<HighlightBox type="info">

For a more detailed explanation of the upgrade process, refer to the [Cosmos SDK documentation](https://docs.cosmos.network/master/modules/upgrade).

</HighlightBox>

## Cosmovisor

Cosmovisor is a tool that node operators can use to automate the on-chain processes described above.

* Cosmovisor runs as a small wrapper around the Cosmos SDK application binaries.
* Cosmovisor watches out for any approved upgrade proposals.
* Cosmovisor can download and run the new binary if wanted.
* When the chain reaches the upgrade block, Cosmovisor also handles the storage upgrade.

<HighlightBox type="tip">

Take a look at the [Cosmos SDK documentation on Cosmovisor](https://docs.cosmos.network/master/run-node/cosmovisor.html) to learn more about this process manager for Cosmos SDK applications.

</HighlightBox>

## Next up

You are all caught up on migrations. Have a look at the code samples below or head to the [next section](./ibc.md) to learn about the Inter-Blockchain Communication Protocol.

<ExpansionPanel title="Show me some code for my checkers blockchain">

The code samples you have seen until now were meant to build your checkers blockchain from the ground up. Imagine you have built it from scratch. It has been running in production for some time with games created, played on, won, and lost. Given its success and following player feedback, you decide to introduce leaderboards. In particular:

* Any player who has **ever** played should have a tally of games won, lost, drawn, and forfeited.
* There should be a leaderboard that lists the players with the most wins, but in limited numbers. For instance only with the top 100 scores.
* To increase engagement, the player with the most recent score takes precedence over an _older_ contender with equal score.

It is not good enough to introduce a leaderboard for players winning and losing. You want to start with all those that played in the past. You are in luck because all past games and their outcomes have been kept in the chain state. What you now need to do is go through them and update the players with their tallies and add the leaderboard.

Call your existing version v1 and your new one, v2, with the leaderboard to disambiguate.

## New information

Of course, you need new data structures for your v2. With Ignite CLI you have:

1. A way to store each player's information:
    ```protobuf
    message PlayerInfo {
        string index = 1; // The stringified address
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```
2. A way to identify a winning player's information in the leaderboard:
    ```protobuf
    message WinningPlayer {
        string playerAddress = 1;
        uint64 wonCount = 2;
        string dateAdded = 3;
    }
    ```
    Where `wonCount` decides the position on the leaderboard and `dateAdded` resolves ties for equal `wonCount` with the most recent ranking higher.
3. Of course a leaderboard as an array of winner information:
    ```protobuf
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```
4. Not to forget that this player information and this leaderboard are stored somewhere in storage and as such you introduce them in the new genesis:
    ```protobuf
    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
        Leaderboard leaderboard = 4;
    }
    ```
    Conceptually, it is the _new_ genesis because your actual genesis file did not contain any leaderboard.
5. And a hard-coded leaderboard length:
    ```go
    const (
        LeaderboardWinnerLength = 100
    )
    ```

## Leaderboard on-the-go updating

You also need to add code to your v2 to update the leaderboard after a game has been determined. It is a lot of array sorting and information adjustment on the previous code.

<HighlightBox type="info">

If you want more details on how to update the leaderboard, take a look at [Run my own chain](../4-my-own-chain/index.md).

</HighlightBox>

## Genesis migration preparation

With the v2 on-the-go updating of the leaderboard taken care of, attend to past players and place them on the leaderboard. You have to create a new v2 genesis where the leaderboard has been added. First, create a new folder `x/checkers/migrations/v1tov2` to handle this part.

Create a new type to make it easier to handle your v1 genesis:

```go
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

It is easy to create as you only need to copy and paste the values of your genesis from a previous commit.

## Past player handling

Now you prepare functions to progressively build the player information given a list of games:

```go
func PopulatePlayerInfosWith(infoSoFar *map[string]*types.PlayerInfo, games *[]*types.StoredGame) (err error) {
    for _, game := range *games {
        // Extract winner
        winnerAddress, err = game.GetRedAddress()
        if err != nil {
            return err
        }
        loserAddress, err = game.GetBlackAddress()
        if err != nil {
            return err
        }
        if game.Winner == rules.RED_PLAYER.Color {
            // Already correct
        } else if game.Winner == rules.BLACK_PLAYER.Color {
            // Swap
            winnerAddress, loserAddress = loserAddress, winnerAddress
        } else {
            // Game is still unresolved.
            continue
        }
        winnerIndex = winnerAddress.String()
        loserIndex = loserAddress.String()
        winnerInfo = getOrNewPlayerInfo(infoSoFar, winnerIndex)
        loserInfo = getOrNewPlayerInfo(infoSoFar, loserIndex)
        winnerInfo.WonCount += 1
        loserInfo.LostCount += 1
        (*infoSoFar)[winnerIndex] = winnerInfo
        (*infoSoFar)[loserIndex] = loserInfo
    }
}
```

## Past leaderboard

At some point, the player information is complete and it is possible to create the leaderboard for these past players. It may have to involve the sorting of a very large array. Perhaps it could be done in tranches:

```go
const (
    // Adjust this length to obtain the best performance over a large map.
    IntermediaryPlayerLength = types.LeaderboardWinnerLength * 2
)
```
Then you run through the player information:

```go
func PopulateLeaderboardWith(leaderboard *types.Leaderboard, additionalPlayers *map[string]*types.PlayerInfo, now time.Time) (err error) {
    partialPlayers := make([]*types.PlayerInfo, IntermediaryPlayerLength)
    for _, playerInfo := range *additionalPlayers {
        partialPlayers = append(partialPlayers, playerInfo)
        if len(partialPlayers) >= cap(partialPlayers) {
            leaderboard.AddCandidatesAndSortAtNow(now, partialPlayers)
            partialPlayers = partialPlayers[:0]
        }
    }
    leaderboard.AddCandidatesAndSortAtNow(now, partialPlayers)
    return nil
}
```

<HighlightBox type="info">

If you want to see more details about the number of helper functions like `AddCandidatesAndSortAtNow`, head to [Run my own chain](../4-my-own-chain/index.md).

</HighlightBox>

## Genesis migration proper

Now that you have all in place migrate the v1 genesis:

```go
func (genesisV1 GenesisStateV1) Convert(now time.Time) (genesis *types.GenesisState, err error) {
    playerInfos := make(map[string]*types.PlayerInfo, 1000)
    err = PopulatePlayerInfosWith(&playerInfos, &genesisV1.StoredGameList)
    if err != nil {
        return nil, err
    }
    leaderboard := CreateLeaderboardForGenesis()
    err = PopulateLeaderboardWith(leaderboard, &playerInfos, now)
    if err != nil {
        return nil, err
    }
    return &types.GenesisState{
        Leaderboard:    leaderboard,
        PlayerInfoList: PlayerInfoMapToList(&playerInfos),
        StoredGameList: genesisV1.StoredGameList,
        NextGame:       genesisV1.NextGame,
    }, nil
}
```

Note how `StoredGameList` and `NextGame` are copied from v1 to v2. Also note that all past players are saved as at `now` since the time was not saved in the game when winning. If you decide to use the `Deadline`, make sure that there are no times in the future.

The migration mechanism helps identify how you can upgrade your blockchain to introduce new features.

</ExpansionPanel>
