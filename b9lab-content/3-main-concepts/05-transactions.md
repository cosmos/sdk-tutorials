# Transactions

## Long-running exercise

Previously, our ABCI application knew of a single transaction type, that of a checkers move, with 4 `int`. With multiple games, this is no longer sufficient. We need to add a transaction type to create a new game. When this is done, someone will create a new game, and this game will mention someone else, i.e. the other player, perhaps the 2 other players. Perhaps, it would be a good idea for the other person to be able to reject the challenge. It would have the added benefit of clearing the state of stale un-started games.

So here is what our transactions would look like in pseudo-code:

* The transaction to create a game:
    ```
    CreateGameTx struct {
        Sender: Address, // Anyone really.
        Message: CreateGameMsg struct {
            players: {
                black: Address,
                red: Address
            }
        }
    }
    ```
* The transaction to do a move, which means accepting the challenge when on a new game:
    ```
    MoveTx struct {
        Sender: Address, // One of the players to be valid.
        Message: MoveMsg struct {
            gameId: id type still to be decided,
            src: Pos struct {
                X int,
                Y int
            },
            dst: Pos struct {
                X int,
                Y int
            }
        }
    }
    ```
* The transaction to reject an un-started game:
    ```
    RejectTx struct {
        Sender: Address, // One of the players to be valid.
        Message: RejectMsg struct {
            gameId: id type still to be decided
        }
    }
    ```

We can already think about some game-theoretical situations. After all, a game involves 2 parties, and they may not always play nice.

* What would happen if 1 of the 2 players has accepted the game by playing, but the other player has neither accepted nor rejected the game? What we could do is:
    * Have a timeout after which the game is canceled. And this cancelation would be handled automatically, in `EndBlock` or whichever equivalent in Cosmos SDK, without any of the players having to trigger the cancelation.
    * Keep an index, a FIFO, or a list of un-started games ordered by cancelation time, so that this automatic trigger does not consume too many resources.
* What would happen if the player whose turn it is never shows up or never sends a valid transaction? What we could do is:
    * Have a timeout after which the game is forfeited.
    * Keep an index of games that could be forfeited. Actually, if both timeouts are the same, we can keep a single FIFO of games so that we clear from the head as necessary.

So we add `timeout: Timestamp` to our `FullGame`, and update it every time something changes in the game. We can decide on a maximum delay, 1 day?

Of note is that we do not have _open_ challenges whereby a player creates a game where the second player is unknown until someone steps in. So player matching is left outside of the blockchain. We leave it to the enterprising student to incorporate it inside the blockchain by changing all models.
