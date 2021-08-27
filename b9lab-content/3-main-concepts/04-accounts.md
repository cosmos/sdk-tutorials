# Accounts

## Long-running exercise

Previously, our ABCI application accepted anonymous checkers moves. This was a problem. With accounts, we are going to restrict moves to the right player.

1. If we planned on staying with a single game, we would do the following:
    * In our `/store`, we would add:
        * `/store/players/black: Address`
        * `/store/players/red: Address`
    * In our `DeliverTx` code, or whichever equivalent in the Cosmos SDK, before calling [`Move()`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274), we would confirm that the move is coming from the right player.
2. But because we want to eventually handle multiple games, we need to define a `FullGame` type in storage, and assign players there, in pseudo-code:
    ```
    struct FullGame {
        board: Game, // Which contains the Pieces and the Turn when in memory.
        players: {
            black: Address,
            red: Address
        }
    }
    ```
    Then, we would have a `Move()` function on the `FullGame` that confirms that the move comes from the right player. For now, we do not look at the serialization of this `FullGame`, and at what path(s) it would go, but we keep in mind that we will need to have all elements serialized.

TODO: in code.
