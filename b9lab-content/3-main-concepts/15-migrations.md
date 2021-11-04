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

Until now you have seen code samples for your checkers blockchain. Let's imagine that it has been running in production for some time and you want now to introduce leaderboards. In particular:

* Any player who has ever played should have a tally of games won, lost, drawn and forfeited.
* There should be a leaderboard that lists the players with the most wins, but in limited number. For instance only with the top 100.

The lucky part is that all past games have been kept in the state. What needs to be done is to go through them and update the players with their tallies, and add the leaderboard.

It is late after everything has been coded and we want to introduce player stats and a leaderboard of players, which lists the number of games won, lost, and rejected, plus the wagers won and lost. So we need:

* In terms of new structure:
    * To store player stats:
        ```
        AllPlayersStats struct {
            [playerAddress]: PlayerStats struct {
                gamesWon: uint32,
                gamesLost: uint32,
                gamesRejected: uint32,
                wagers: PlayerWagerStats struct {
                    [tokenType]: PlayerPerTokenStats struct {
                        wagersWon: uint32,
                        wagersLost: uint32
                    }
                }
            }
        }
        ```
    * To store leaderboard information in storage. The top 100 players ordered in descending order:
        ```
        Leaderboard struct {
            mostGamesWon: Address[100],
            mostGamesLost: Address[100],
            mostGamesRejected: Address[100],
            wagers: WagerLeaderboard struct {
                [tokenType]: WagerLeaderboardPerToken struct {
                    mostWagersWon: Address[100],
                    mostWagersLost: Address[100]
                }
            }
        }
        ```
    * Both these structures are to be updated after each transaction.
    * Question: how do we identify the token type?
    * Presumably we do not need to update the gas costs.
* In terms of the past, which is where migrations come in:
    * To populate with the result of previous games. Is it possible to achieve this with past events only, if past games were deleted from storage?

TODO write new code and the migration script.

</ExpansionPanel>
