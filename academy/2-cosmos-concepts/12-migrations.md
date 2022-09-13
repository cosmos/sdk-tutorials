---
title: "Migrations"
order: 13
description: How to handle on-chain upgrades
tags: 
  - concepts
  - cosmos-sdk
---

# Migrations

<HighlightBox type="prerequisite">

To better understand this section, first read the following sections:

* [Messages](./messages.md)
* [Protobuf](./protobuf.md)

</HighlightBox>

<HighlightBox type="learning">

Have you ever wondered how an upgrade is done in the Cosmos SDK? In this section you will find out how Cosmos SDK migrations are conducted.
<br></br>
Blockchains can be upgraded through a predictable process that reliably avoids forks. Discover the Cosmos comprehensive process that includes governance, data migrations, node upgrades, and more, to ensure upgrades proceed smoothly and without service disruption.
<br></br>
At the end of the section, the code example demonstrates how you would use migration to upgrade your checkers blockchain with new features even after it has been in operation for some time.

</HighlightBox>

A Cosmos SDK application running on a Cosmos blockchain can be upgraded in an orderly, on-chain fashion.

<HighlightBox type="info">

Upgrading blockchains and blockchain applications is notoriously difficult and risky. The Cosmos SDK solves the common risks and challenges.

</HighlightBox>

Generally, when a blockchain is upgraded it is vital that all nodes upgrade simultaneously and at the same block height. This is difficult to achieve in a disorderly setting. If the nodes do not coordinate, then the blockchain will "fork" into two blockchains with a common history: one chain that observes the new rules, and one chain that observes the old rules. It is generally not possible for these two chains to reach a common consensus or merge in the future.

<HighlightBox type="info">

Upgrading a live chain without software support for upgrades is risky, because all the validators need to pause their state machines at the same block height and apply the upgrade before resuming. If this is not done correctly, there can be state inconsistencies, which are hard to recover from.

</HighlightBox>

<HighlightBox type="info">

Smart contracts on EVM chains such as Ethereum are immutable software. They are difficult or impossible to change by definition. Various strategies based on modularity can simulate the effects of upgrading smart contracts, but all known methods have inherent limitations, in particular the difficulties, impossibility, or prohibitive costs of re-organizing data at rest. This places a significant limitation on the types of upgrades that are feasible.

</HighlightBox>

**A Cosmos SDK blockchain built for a specific application can be upgraded without forks.** If a new version of the blockchain application uses a different data layout than exists on the chain, the existing data can be reorganized before the new version of the application comes online. The data migration is defined by the developer and runs in each node quickly and cost-effectively before the node returns to service.

## Process overview

### Plan

A "plan" is an upgrade process to take place at a specific block height in the future. It includes a `SideCar` process that executes when the upgrade commences, which names the plan and specifies a block height at which to execute.

<HighlightBox type="info">

Acceptance or rejection of the plan is managed through the normal governance process. A "cancel proposal" can be submitted and adopted, preventing the plan from executing. Cancellation is contingent on knowing that a given plan is a poor idea before the upgrade happens.

</HighlightBox>

The `Info` in a plan kicks off the `SideCar` process:

```go
type Plan struct {
  Name   string
  Height int64
  Info   string
}
```

### `Sidecar` process

A `SideCar` is a binary which nodes can run to attend to processes outside of Cosmos binaries. This can include steps such as downloading and compiling software from a certain commit in a repo.

### `UpgradeHandler`

An `UpgradeHandler` may be executed after the `SideCar` process is finished and the binary has been upgraded. It attends to on-chain activities that may be necessary before normal processing resumes. An upgrade handler may trigger a `StoreLoader`.

### `StoreLoader`

A `StoreLoader` prepares the on-chain state for use by the new binary. This can include reorganizing existing data. The node does not resume normal operation until the store loader has returned and the handler has completed its work.

### Proposal

Governance uses proposals that are voted on and adopted or rejected. An upgrade proposal takes the form of accepting or rejecting a plan that is prepared and submitted through governance. Proposals can be withdrawn before execution with cancellation proposals.

## Advantages

Coordinated upgrades attend to the challenging process of upgrading blockchain applications and blockchain platforms.

The main advantages of this form of coordinated upgrades are:

* **Avoidance of forks:** all validators move together at a pre-determined block height.
* **Smooth upgrade of binaries:** the new software is adopted in an automated fashion.
* **Reorganizing data stores:** data at rest can be reorganized as needed by processes that are not limited by factors such as a block gas limit.

## Effect of upgrades

Blockchains are paused at the block height of an adopted plan. This initiates the upgrade process. The upgrade process itself may include switching to a new binary that is relatively small to download and install, or it may include an extensive data reorganization process. The validator stops processing blocks until it completes the process in either case.

The validator resumes processing blocks when the handler is satisfied with the completeness degree of the upgrade. From a user perspective, this appears as a pause which resumes with the new version.

## Application-specific

The `SideCar`, handler, and store loader are application-specific. At each block, the Cosmos SDK checks for a plan that should be executed before processing block transactions. If none exists, then processing continues as usual. If a plan is scheduled to run, then the Cosmos SDK pauses normal processing and loads the `SideCar`. When the SideCar is finished, it loads the handler and optionally the store loader.

Application developers build implementations of those components that are tailored to their application and use case.

<HighlightBox type="docs">

For a more detailed explanation of the upgrade process, see the [Cosmos SDK documentation](https://docs.cosmos.network/main/modules/upgrade).

</HighlightBox>

## Cosmovisor

Cosmovisor is a tool that node operators can use to automate the on-chain processes described above.

* Cosmovisor runs as a small wrapper around the Cosmos SDK application binaries.
* Cosmovisor watches for any approved upgrade proposals.
* Cosmovisor can download and run the new binary if wanted.
* When the chain reaches the upgrade block, Cosmovisor also handles the storage upgrade.

<HighlightBox type="docs">

See the [Cosmos SDK documentation on Cosmovisor](https://docs.cosmos.network/main/run-node/cosmovisor.html) to learn more about this process manager for Cosmos SDK applications.

</HighlightBox>

## Code example

<ExpansionPanel title="Show me some code for my checkers blockchain">

The code samples you have seen previously were meant to build your checkers blockchain from the ground up. Now imagine it has been running in production for some time, with games created, played on, won, and lost. Given its success and following player feedback, you decide to introduce leaderboards. In particular:

* Any player who has **ever** played should have a tally of games won, lost, drawn, and forfeited.
* There should be a leaderboard that lists the players with the most wins, but in limited numbers (for instance, only the top 100 scores).
* To increase engagement, the player with the most recent score takes precedence over an _older_ contender with an equal score.

It is not good enough to introduce a leaderboard for players currently winning and losing: you want to start with **all** those that played in the past. Fortunately, all past games and their outcomes have been kept in the chain state. What you need to do is go through the record, update the players with their tallies, and add a leaderboard.
<br></br>
Call your existing version "v1". To disambiguate, call your new one with the leaderboard "v2".
<br></br>
**New information**

You need new data structures for v2. With Ignite CLI you have:

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

    `wonCount` decides the position on the leaderboard, and `dateAdded` resolves ties for equal `wonCount`s, with the most recent ranking higher.
3. Now you need a leaderboard as an array of winner information:

    ```protobuf
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```

4. Because this player information and this leaderboard are stored somewhere in storage, you must introduce them in the new genesis:

    ```protobuf
    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
        Leaderboard leaderboard = 4;
    }
    ```

    Conceptually, it is the _new_ genesis because your actual genesis file did not contain any leaderboard.
5. Finally, you must set a hard-coded leaderboard length:

    ```go
    const (
        LeaderboardWinnerLength = 100
    )
    ```

**Leaderboard on-the-go updating**

You will need to add code to v2 to update the leaderboard after a game has been determined. This means a lot of array sorting and information adjustment on the previous code.

<HighlightBox type="tip">

If you want more details on how to update the leaderboard, look at [Running Your Own Cosmos Chain](../3-my-own-chain/index.md).

</HighlightBox>

**Genesis migration preparation**

With on-the-go updating of the leaderboard taken care of for v2, you must place past players on the leaderboard. You need a new v2 genesis where the leaderboard has been added. First, create a new folder `x/checkers/migrations/v1tov2` to handle this task.
<br></br>
Create a new type to make it easier to handle your v1 genesis:

```go
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

This is easy to create, as you only need to copy and paste the values of your genesis from a previous commit.
<br></br>
**Past player handling**

Now prepare functions to progressively build the player's information, given a list of games:

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

**Past leaderboard**

Eventually the player information is complete and it is possible to create the leaderboard for these past players. This may involve the sorting of a very large array. Perhaps it could be done in tranches:

```go
const (
    // Adjust this length to obtain the best performance over a large map.
    IntermediaryPlayerLength = types.LeaderboardWinnerLength * 2
)
```

Then process the player information:

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

<HighlightBox type="tip">

If you want more details about the number of helper functions like `AddCandidatesAndSortAtNow`, go to [Running Your Own Cosmos Chain](../3-my-own-chain/index.md).

</HighlightBox>

**Proper genesis migration**

Now everything is prepared, migrate the v1 genesis:

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

Note that `StoredGameList` and `NextGame` are copied from v1 to v2. Also note that all past players are saved `now`, since the time was not saved in the game when winning. If you decide to use the `Deadline`, make sure that there are no times in the future.
<br></br>
The migration mechanism helps identify how you can upgrade your blockchain to introduce new features.

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How Cosmos SDK migrations provide developers with an orderly, on-chain process for upgrading their applications, reliably avoiding forks through the use of a "plan" in which upgrades are proposed to occur at a specific future block height. 
* How consensus over accepting or rejecting a plan is reached through the normal governance process, ensuring unity across all nodes, as is any "cancel proposal" intended to prevent a previously accepted plan from executing.
* How the temporary halting of normal activity allows for simultaneous and potentially profound modifications of the blockchain across all nodes, including the reorganization of existing data stores to maintain compatibility with the upgraded application.

</HighlightBox>

<!--## Next up

You are now up-to-date on migrations. Look at the above code samples, or go to the [next section](./bridges.md) to discover bridges in the Cosmos SDK.-->
<!-- You are now up-to-date on migrations. Look at the following code samples, or go to the [next section](./ibc.md) to learn about the Inter-Blockchain Communication Protocol. -->
