---
title: "Migrations"
order: 13
description: How to handle on-chain upgrades
tag:
---

# Migrations

## Long-running exercise

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
