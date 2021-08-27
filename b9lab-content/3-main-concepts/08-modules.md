# Modules

## Long-running exercise

Earlier we mentioned that we want to let players play with money. Here, with the introduction of modules like Bank, we can start handling that.

The initial ideas are:

* When creating a game, the wager amount is declared.
* When doing their first move, which is interpreted as "challenge accepted", each player will be billed the amount.
    * If the other player rejects the game, the game times out, at this point, then the first player gets refunded.
* Subsequent moves by a player do not cost anything.
* If a game ends in a win or times out on a forfeit, then the winning player gets double the wager amount.
* If a game ends in a draw, then both players get back their amount.

In terms of code, our `CreateGameMsg struct` needs a `wager: uint32`, to be understood in the staking token currency.

We need to decide _where_ the money goes when a player is debited, because we do not want the token's total supply to vary because of that. Perhaps we use the concept of authz account, or assign it "in the game" if this is possible.
