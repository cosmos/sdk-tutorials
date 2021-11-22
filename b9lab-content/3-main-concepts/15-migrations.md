# Migrations

## On-chain Upgrades

A Cosmos SDK application running on a Cosmos blockchain can be upgraded in an orderly, on-chain fashion.

Upgrading blockchains and blockchain applications is notoriously difficult and risky. Cosmos SDK solves for the common risks and challenges. What are those challenges and risks that Cosmos SDK solves?

Generally, when a blockchain is upgraded it is vital that all nodes upgrade simultaneously and at the same block height. In a disorderly setting, this is difficult to actually achieve. If the nodes do not do so then the blockchain will "fork" into two blockchains with common history - one chain that observes the new rules and one chain that observes the old rules. It is generally not possible for the two chains to reach a common consensus or merge together in the future.

<HighlightBox type="info">

Without software support for upgrades, upgrading a live chain is risky because all of the validators need to pause their state machines at exactly the same block height and apply the upgrade before resuming. If this is not done correctly, there can be state inconsistencies which are hard to recover from.

</HighlightBox>

Smart contracts on EVM chains such as Ethereum are immutable software. By definition, they are difficult or impossible to change. Various strategies based on modularity can simulate the effects of upgrading the contracts but all known methods have inherent limitations. Chief among the limitations are the difficulties, impossibility or prohibitive cost of reorganizing data at rest. This places a significant limitation on the types of upgrades that are feasible.

A Cosmos SDK blockchain built for a specific application can be upgraded without forks and, if necessary, the existing data can be reorganized to prepare it for use by a new version of the application and blockchain.

## Process Overview

### Plan

A "Plan" is an upgrade process to take place at a specific block height in the future. It includes a SideCar (see below) that executes when the upgrade process commences, a name of the plan and block height at which to execute. Importantly, acceptance or rejection of the plan is managed through the normal governance process. A "cancel proposal" can be submitted and adopted which prevents the plan from executing. Cancellation is contingent on knowing that a given Plan is a poor idea before the upgrade happens.  

The "Info" in a plan kicks off the sidecar process.

```shell
type Plan struct {
  Name   string
  Height int64
  Info   string
}
```

### Sidecar Process

A "Sidecar" is a binary the nodes can run to attend to processes outside of Cosmos binaries. This can include steps such as downloading and compiling software from a certain commit in a repo.

### UpgradeHandler

An "UpgradeHandler" may be executed after the sidecar process is finished and the binary has been upgraded. An upgrade handler attends to on-chain activities that may be necessary before normal processing resumes. An upgrade handler may trigger a store loader.

### StoreLoader

A StoreLoader prepares the on-chain state for use by the new binary. This can include reorganizing existing data. The node does not resume normal operation until the store loader has returned and the handler has completed its work.

### Proposal

Governance uses proposals that are voted on, adopted or rejected. An upgrade proposal take the form of accepting or rejecting a plan that is prepared and submitted through governance. Proposals can be withdrawn (prior to execution) with cancellation proposals.

## Advantages

Coordinated upgrades attend to the challenging process of upgrading blockchain applications and blockchain platforms.

* Avoidance of forks, because all validators move together at a predetermined block height.
* Smooth upgrade of binaries, because the new software is adopted in an automated fashion.
* Reorganizing data stores, because data at rest can be reorganized as needed by processes that are not limited by factors such as a block gas limit.

## Effect of Upgrades

Blockchains are paused at the block height of an adopted plan. This initiates the upgrade process. The upgrade process itself may include switching to a new binary that is relatively small to download and install, or it may include an extensive data reorganization process. In either case, the validator stops processing blocks until it completes the process. When the handler is satisfied that the upgrade is complete, the validator resumes processing blocks. From a user perspective, this appears as a pause and resume with the new version.

## Application-Specific

The sidecar, handler and store loader are application-specific. At each block, Cosmos SDK checks for a plan that should be executed before processing block transactions. If none exists, the processing continues as usual. If a plan is scheduled to run, then Cosmos SDK pauses normal processing and loads the sidecar. When the sidecar is finished and the binaries are uploaded, it loads the handler and, optionally, the store loader.

Application developers build implementations of those components that are tailored to their application and use-case.

<HighlightBox type="info">

For a more detailed explanation of the upgrade process, refer to the [Cosmos SDK documentation](https://docs.cosmos.network/master/modules/upgrade)

</HighlightBox>

<ExpansionPanel title="Show me some code for my checkers blockchain">

Until now, the code samples you have seen were meant to build your checkers blockchain from the ground up. Now, imagine you have built it from scratch. It has been running in production for some time, with games created, played on, won and lost. Given its success, and following player feedback, you decide to introduce leaderboards. In particular:

* Any player who has **ever** played should have a tally of games won, lost, drawn and forfeited.
* There should be a leaderboard that lists the players with the most wins, but in limited number. For instance only with the top 100 scores.
* In order to increase engagement, at equal scores, a player that reached that score the most recently takes precedence over an _older_ contender.

It is not good enough to introduce a leaderboard for players winning and losing from now on. You want to start with all those that played in the past. You are in luck because all past games, and their outcomes, have been kept in the chain state. What you now need to do is go through them and update the players with their tallies, and add the leaderboard.

To disambiguate, call your existing version v1, and your new one, v2, with the leaderboard.

## New Information

Of course you need new data structures for your v2. No need to expand too long on it, so, with the use of Starport, you have:

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
    Where `wonCount` decides the position on the leaderboard, and `dateAdded` resolves ties for equal `wonCount`, with the most recent ranking higher.
3. Of course a leaderboard as an array of winner information:
    ```protobuf
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```
4. Not to forget that these player information and this leaderboard are stored somewhere in storage, and as such you introduce them in the new genesis:
    ```protobuf
    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
        Leaderboard leaderboard = 4;
    }
    ```
    Conceptually, it is the _new_ genesis because your actual genesis file did not contain any leadboard.
5. And a hard-coded leaderboard length:
    ```go
    const (
        LeaderboardWinnerLength = 100
    )
    ```

## Leaderboard On-The-Go Updating

With the information in place, you also need to add code to your v2 to update the leaderboard after a game has been determined. It's a lot of array sorting and information adjustment on the previous code. If you want more details, look at [Run my own chain](./5-my-own-chain/01-index).

## Genesis Migration Preparation

With the v2 on-the-go updating of the leaderboard taken care of, you now have to attend to past players and place them on the leaderboard. In effect, you have to create a new v2 genesis where the leaderboard has been added. First create a new folder `x/checkers/migrations/v1tov2` to handle this part.

Then to make it easier to handle your v1 genesis, you create a new type:

```go
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```
It is easy to create as you only need copy and paste the values of your genesis from a previous commit.

## Past Player Handling

Now, at the core, you prepare functions to progressively build the player information given a list of games:

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

## Past Leaderboard

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
If you want to see more details about the number of helper functions like `AddCandidatesAndSortAtNow`, head to [Run my own chain](./5-my-own-chain/01-index).

## Genesis Migration Proper

Now that you have all in place, it is time to migrate the v1 genesis:

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
Notice how `StoredGameList` and `NextGame` are copied wholesale from v1 to v2, and for good reason, there is no change there. Also note that all past players are saved as at `now`, since the time was not saved in the game when winning. If you decide to use the `Deadline`, make sure that there are no times in the future.

With this migration mechanism you see how you can upgrade your blockchain to introduce new features.

</ExpansionPanel>
